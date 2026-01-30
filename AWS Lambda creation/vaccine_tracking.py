"""
ImmuniT Vaccine Tracking Lambda Function
Manages vaccine records and provides booster recommendations
"""

import json
import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
vaccine_records_table = dynamodb.Table(os.environ.get('VACCINE_RECORDS_TABLE', 'ImmuniT-VaccineRecords'))
immunity_metrics_table = dynamodb.Table(os.environ.get('IMMUNITY_METRICS_TABLE', 'ImmuniT-ImmunityMetrics'))

# Vaccine schedule database (simplified)
VACCINE_SCHEDULES = {
    'COVID-19 (Pfizer-BioNTech)': {
        'booster_interval_days': 365,
        'protection_threshold': 300,
        'waning_rate': 0.15  # 15% decline per month
    },
    'COVID-19 (Moderna)': {
        'booster_interval_days': 365,
        'protection_threshold': 300,
        'waning_rate': 0.15
    },
    'Influenza': {
        'booster_interval_days': 365,
        'protection_threshold': 200,
        'waning_rate': 0.20
    },
    'Tetanus/Diphtheria': {
        'booster_interval_days': 3650,  # 10 years
        'protection_threshold': 100,
        'waning_rate': 0.02
    },
    'Hepatitis A': {
        'booster_interval_days': 1825,  # 5 years
        'protection_threshold': 150,
        'waning_rate': 0.05
    },
    'Hepatitis B': {
        'booster_interval_days': 3650,
        'protection_threshold': 150,
        'waning_rate': 0.03
    },
    'MMR': {
        'booster_interval_days': 10950,  # 30 years (lifetime)
        'protection_threshold': 200,
        'waning_rate': 0.01
    },
    'Yellow Fever': {
        'booster_interval_days': 3650,
        'protection_threshold': 250,
        'waning_rate': 0.03
    }
}

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def respond(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def add_vaccine_record(user_id, vaccine_data):
    """Add a new vaccination record"""
    try:
        current_time = int(datetime.utcnow().timestamp())
        vaccine_name = vaccine_data.get('vaccine_name')
        
        if not vaccine_name:
            return respond(400, {'error': 'vaccine_name is required'})
        
        # Get vaccine schedule info
        schedule = VACCINE_SCHEDULES.get(vaccine_name, {})
        booster_interval = schedule.get('booster_interval_days', 365)
        
        # Calculate next due date
        admin_date = vaccine_data.get('admin_date', current_time)
        next_due_timestamp = admin_date + (booster_interval * 86400)
        
        record_id = f"vax_{datetime.utcfromtimestamp(admin_date).strftime('%Y%m%d')}_{vaccine_name.replace(' ', '_').replace('(', '').replace(')', '').lower()}"
        
        vaccine_record = {
            'record_id': record_id,
            'user_id': user_id,
            'vaccine_name': vaccine_name,
            'vaccine_type': vaccine_data.get('vaccine_type', ''),
            'manufacturer': vaccine_data.get('manufacturer', ''),
            'admin_date': admin_date,
            'next_due_date': next_due_timestamp,
            'batch_number': vaccine_data.get('batch_number', ''),
            'location': vaccine_data.get('location', ''),
            'provider': vaccine_data.get('provider', ''),
            'dose_number': vaccine_data.get('dose_number', 1),
            'protection_status': 'pending',  # Will be updated after test
            'efficacy_percentile': 0
        }
        
        vaccine_records_table.put_item(Item=vaccine_record)
        
        return respond(201, {
            'message': 'Vaccine record added successfully',
            'record': vaccine_record
        })
        
    except Exception as e:
        print(f"Error adding vaccine record: {str(e)}")
        return respond(500, {'error': 'Failed to add vaccine record', 'details': str(e)})

def get_vaccine_history(user_id):
    """Retrieve complete vaccination history for a user"""
    try:
        response = vaccine_records_table.query(
            IndexName='user-vaccine-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False  # Most recent first
        )
        
        records = response['Items']
        
        # Get latest immunity metrics to update protection status
        metrics_response = immunity_metrics_table.query(
            IndexName='user-metrics-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        # Update records with current protection status
        if metrics_response['Items']:
            latest_metrics = metrics_response['Items'][0]
            vaccine_metrics = latest_metrics.get('vaccines', {})
            
            for record in records:
                vaccine_name = record['vaccine_name']
                if vaccine_name in vaccine_metrics:
                    record['current_protection'] = vaccine_metrics[vaccine_name]
        
        return respond(200, {
            'user_id': user_id,
            'vaccine_history': records,
            'total_vaccines': len(records)
        })
        
    except Exception as e:
        print(f"Error retrieving vaccine history: {str(e)}")
        return respond(500, {'error': 'Failed to retrieve vaccine history', 'details': str(e)})

def get_booster_recommendations(user_id):
    """Generate personalized booster recommendations"""
    try:
        current_time = datetime.utcnow()
        current_timestamp = int(current_time.timestamp())
        
        # Get vaccine history
        vaccine_response = vaccine_records_table.query(
            IndexName='user-vaccine-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        
        # Get latest immunity metrics
        metrics_response = immunity_metrics_table.query(
            IndexName='user-metrics-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        if not metrics_response['Items']:
            return respond(200, {
                'message': 'No immunity data available. Please complete a test first.',
                'recommendations': []
            })
        
        latest_metrics = metrics_response['Items'][0]
        vaccine_metrics = latest_metrics.get('vaccines', {})
        
        recommendations = []
        
        # Analyze each vaccine
        for vaccine_name, metrics in vaccine_metrics.items():
            protection_level = metrics.get('protection_level', 0)
            status = metrics.get('status', 'unknown')
            trend = metrics.get('trend', 'stable')
            
            # Find most recent vaccination for this vaccine
            vaccine_records = [r for r in vaccine_response['Items'] 
                             if r['vaccine_name'] == vaccine_name]
            
            if vaccine_records:
                latest_vaccine = max(vaccine_records, key=lambda x: x['admin_date'])
                admin_date = datetime.utcfromtimestamp(latest_vaccine['admin_date'])
                days_since = (current_time - admin_date).days
                
                # Get schedule info
                schedule = VACCINE_SCHEDULES.get(vaccine_name, {})
                recommended_interval = schedule.get('booster_interval_days', 365)
                
                # Determine urgency
                if status == 'not_protected':
                    urgency = 'urgent'
                    recommendation = 'Booster needed immediately'
                    priority = 1
                elif status == 'waning' or protection_level < 60:
                    urgency = 'high'
                    recommendation = 'Booster recommended within 1 month'
                    priority = 2
                elif days_since >= recommended_interval * 0.9:
                    urgency = 'moderate'
                    recommendation = 'Booster due soon'
                    priority = 3
                elif trend == 'declining' and protection_level < 80:
                    urgency = 'low'
                    recommendation = 'Monitor closely, booster may be needed'
                    priority = 4
                else:
                    urgency = 'none'
                    recommendation = 'Protection adequate, continue monitoring'
                    priority = 5
                
                recommendations.append({
                    'vaccine_name': vaccine_name,
                    'current_protection_level': protection_level,
                    'status': status,
                    'urgency': urgency,
                    'priority': priority,
                    'recommendation': recommendation,
                    'days_since_last_dose': days_since,
                    'recommended_interval_days': recommended_interval,
                    'last_vaccination_date': admin_date.strftime('%Y-%m-%d'),
                    'trend': trend
                })
        
        # Sort by priority
        recommendations.sort(key=lambda x: x['priority'])
        
        return respond(200, {
            'user_id': user_id,
            'recommendations': recommendations,
            'urgent_count': sum(1 for r in recommendations if r['urgency'] == 'urgent'),
            'high_priority_count': sum(1 for r in recommendations if r['urgency'] == 'high')
        })
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return respond(500, {'error': 'Failed to generate recommendations', 'details': str(e)})

def get_vaccine_comparison(user_id):
    """Compare user's vaccine efficacy vs population averages"""
    try:
        # Get latest immunity metrics
        metrics_response = immunity_metrics_table.query(
            IndexName='user-metrics-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        if not metrics_response['Items']:
            return respond(404, {'error': 'No immunity data available'})
        
        latest_metrics = metrics_response['Items'][0]
        vaccine_metrics = latest_metrics.get('vaccines', {})
        
        # Population thresholds (simplified - would come from real data)
        population_thresholds = {
            'COVID-19 (Pfizer-BioNTech)': 70,
            'COVID-19 (Moderna)': 70,
            'Influenza': 60,
            'Tetanus/Diphtheria': 85,
            'Hepatitis A': 75,
            'Hepatitis B': 80,
            'MMR': 90,
            'Yellow Fever': 85
        }
        
        comparisons = []
        
        for vaccine_name, metrics in vaccine_metrics.items():
            user_efficacy = metrics.get('protection_level', 0)
            herd_threshold = population_thresholds.get(vaccine_name, 70)
            
            comparison = {
                'vaccine_name': vaccine_name,
                'your_efficacy': user_efficacy,
                'herd_threshold': herd_threshold,
                'above_threshold': user_efficacy >= herd_threshold,
                'difference': user_efficacy - herd_threshold,
                'population_percentile': metrics.get('population_percentile', 50)
            }
            
            comparisons.append(comparison)
        
        return respond(200, {
            'user_id': user_id,
            'comparisons': comparisons
        })
        
    except Exception as e:
        print(f"Error generating comparison: {str(e)}")
        return respond(500, {'error': 'Failed to generate comparison', 'details': str(e)})

def lambda_handler(event, context):
    """Main Lambda handler"""
    
    print(f"Received event: {json.dumps(event)}")
    
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    path_params = event.get('pathParameters') or {}
    query_params = event.get('queryStringParameters') or {}
    
    try:
        # POST /vaccines - Add vaccine record
        if http_method == 'POST' and path == '/vaccines':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            if not user_id:
                return respond(400, {'error': 'user_id is required'})
            return add_vaccine_record(user_id, body)
        
        # GET /vaccines/{user_id} - Get vaccine history
        elif http_method == 'GET' and path.startswith('/vaccines/') and 'recommendations' not in path:
            user_id = path_params.get('user_id')
            return get_vaccine_history(user_id)
        
        # GET /vaccines/{user_id}/recommendations - Get booster recommendations
        elif http_method == 'GET' and 'recommendations' in path:
            user_id = path_params.get('user_id')
            return get_booster_recommendations(user_id)
        
        # GET /vaccines/{user_id}/comparison - Get population comparison
        elif http_method == 'GET' and 'comparison' in path:
            user_id = path_params.get('user_id')
            return get_vaccine_comparison(user_id)
        
        else:
            return respond(400, {'error': 'Invalid request'})
            
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return respond(500, {'error': 'Internal server error', 'details': str(e)})
