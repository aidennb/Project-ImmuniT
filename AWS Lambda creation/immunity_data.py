"""
ImmuniT Immunity Data Lambda Function
Handles ingestion and retrieval of test results and immunity metrics
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
import uuid

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')

# Tables
test_results_table = dynamodb.Table(os.environ.get('TEST_RESULTS_TABLE', 'ImmuniT-TestResults'))
immunity_metrics_table = dynamodb.Table(os.environ.get('IMMUNITY_METRICS_TABLE', 'ImmuniT-ImmunityMetrics'))
vaccine_records_table = dynamodb.Table(os.environ.get('VACCINE_RECORDS_TABLE', 'ImmuniT-VaccineRecords'))
autoimmune_table = dynamodb.Table(os.environ.get('AUTOIMMUNE_TABLE', 'ImmuniT-AutoimmuneMarkers'))
allergen_table = dynamodb.Table(os.environ.get('ALLERGEN_TABLE', 'ImmuniT-AllergenData'))
neuroprotective_table = dynamodb.Table(os.environ.get('NEURO_TABLE', 'ImmuniT-NeuroprotectiveMarkers'))

# S3 bucket for raw data
S3_BUCKET = os.environ.get('RAW_DATA_BUCKET', 'immunit-raw-data')

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

def ingest_test_results(user_id, test_data):
    """
    Ingest raw PepSeq test results
    Stores raw data in S3 and metadata in DynamoDB
    """
    try:
        test_id = f"test_{datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"
        current_time = int(datetime.utcnow().timestamp())
        
        # Store raw peptide data in S3
        s3_key = f"{user_id}/{test_id}.json"
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=json.dumps(test_data.get('raw_peptide_data', {})),
            ContentType='application/json',
            ServerSideEncryption='AES256'
        )
        
        # Store metadata in DynamoDB
        test_record = {
            'test_id': test_id,
            'user_id': user_id,
            'test_date': current_time,
            'sample_id': test_data.get('sample_id', ''),
            'processing_status': 'processing',
            'data_location': f"s3://{S3_BUCKET}/{s3_key}",
            'peptide_count': test_data.get('peptide_count', 0),
            'quality_score': Decimal(str(test_data.get('quality_score', 0.0)))
        }
        
        test_results_table.put_item(Item=test_record)
        
        # Trigger async processing (would normally invoke another Lambda)
        # For now, immediately process metrics
        metrics = calculate_immunity_metrics(user_id, test_id, test_data)
        
        return respond(201, {
            'message': 'Test results ingested successfully',
            'test_id': test_id,
            'metrics': metrics
        })
        
    except Exception as e:
        print(f"Error ingesting test results: {str(e)}")
        return respond(500, {'error': 'Failed to ingest test results', 'details': str(e)})

def calculate_immunity_metrics(user_id, test_id, test_data):
    """
    Calculate immunity metrics from raw test data
    This would normally use sophisticated algorithms - simplified here
    """
    try:
        current_time = int(datetime.utcnow().timestamp())
        
        # Extract vaccine metrics
        vaccine_data = test_data.get('vaccine_antibodies', {})
        vaccine_metrics = {}
        
        for vaccine_name, data in vaccine_data.items():
            titer = data.get('titer', 0)
            
            # Simple protection calculation (replace with actual algorithm)
            if titer > 400:
                status = 'protected'
                protection_level = min(100, int((titer / 500) * 100))
            elif titer > 200:
                status = 'waning'
                protection_level = int((titer / 400) * 100)
            else:
                status = 'not_protected'
                protection_level = int((titer / 200) * 50)
            
            vaccine_metrics[vaccine_name] = {
                'protection_level': protection_level,
                'status': status,
                'antibody_titer': titer,
                'population_percentile': data.get('percentile', 50),
                'trend': data.get('trend', 'stable')
            }
        
        # Store vaccine metrics
        metric_record = {
            'metric_id': f"metric_{datetime.utcnow().strftime('%Y%m%d')}_{vaccine_name.replace(' ', '_').lower()}",
            'user_id': user_id,
            'metric_type': 'vaccine_protection',
            'calculated_date': current_time,
            'test_id': test_id,
            'vaccines': vaccine_metrics
        }
        
        immunity_metrics_table.put_item(Item=metric_record)
        
        # Process autoimmune markers
        if 'autoimmune_markers' in test_data:
            process_autoimmune_data(user_id, test_id, test_data['autoimmune_markers'])
        
        # Process allergen data
        if 'allergen_data' in test_data:
            process_allergen_data(user_id, test_id, test_data['allergen_data'])
        
        # Process neuroprotective markers
        if 'neuroprotective_markers' in test_data:
            process_neuroprotective_data(user_id, test_id, test_data['neuroprotective_markers'])
        
        return {
            'vaccine_metrics': vaccine_metrics,
            'processing_complete': True
        }
        
    except Exception as e:
        print(f"Error calculating metrics: {str(e)}")
        raise

def process_autoimmune_data(user_id, test_id, markers_data):
    """Process and store autoimmune marker data"""
    try:
        current_time = int(datetime.utcnow().timestamp())
        
        markers = {}
        flagged = []
        
        for marker_name, data in markers_data.items():
            reactivity = data.get('reactivity', 0)
            percentile = data.get('percentile', 50)
            
            # Determine risk status
            if percentile > 95:
                risk = 'high'
                flagged.append(marker_name)
            elif percentile > 75:
                risk = 'elevated'
            else:
                risk = 'low'
            
            markers[marker_name] = {
                'reactivity_level': reactivity,
                'population_percentile': percentile,
                'risk_status': risk,
                'associated_conditions': data.get('conditions', [])
            }
        
        marker_record = {
            'marker_id': f"auto_{datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}",
            'user_id': user_id,
            'test_id': test_id,
            'test_date': current_time,
            'markers': markers,
            'overall_risk_score': calculate_risk_score(markers),
            'flagged_markers': flagged
        }
        
        autoimmune_table.put_item(Item=marker_record)
        
    except Exception as e:
        print(f"Error processing autoimmune data: {str(e)}")
        raise

def process_allergen_data(user_id, test_id, allergen_data):
    """Process and store allergen reactivity data"""
    try:
        current_time = int(datetime.utcnow().timestamp())
        
        food_allergens = {}
        env_allergens = {}
        
        for allergen_name, data in allergen_data.items():
            reactivity = data.get('reactivity', 0)
            allergen_type = data.get('type', 'environmental')
            
            # Determine risk level
            if reactivity > 70:
                risk = 'high'
            elif reactivity > 40:
                risk = 'moderate'
            elif reactivity > 15:
                risk = 'low'
            else:
                risk = 'very_low'
            
            allergen_info = {
                'reactivity': reactivity,
                'risk_level': risk,
                'population_percentile': data.get('percentile', 50)
            }
            
            if allergen_type == 'food':
                food_allergens[allergen_name] = allergen_info
            else:
                env_allergens[allergen_name] = allergen_info
                env_allergens[allergen_name]['seasonal_pattern'] = data.get('seasonal', False)
        
        allergen_record = {
            'allergen_id': f"allergy_{datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}",
            'user_id': user_id,
            'test_id': test_id,
            'test_date': current_time,
            'food_allergens': food_allergens,
            'environmental_allergens': env_allergens
        }
        
        allergen_table.put_item(Item=allergen_record)
        
    except Exception as e:
        print(f"Error processing allergen data: {str(e)}")
        raise

def process_neuroprotective_data(user_id, test_id, neuro_data):
    """Process and store neuroprotective antibody data"""
    try:
        current_time = int(datetime.utcnow().timestamp())
        
        # Protective thresholds (based on clinical data like Lequembi/Kinsula)
        thresholds = {
            'beta_amyloid': 300,
            'tau': 250,
            'alpha_synuclein': 300,
            'TDP_43': 280,
            'HERV_K_Env': 250,
            'heat_shock_proteins': 350
        }
        
        markers = {}
        total_protection = 0
        marker_count = 0
        
        for marker_name, data in neuro_data.items():
            level = data.get('level', 0)
            threshold = thresholds.get(marker_name, 250)
            percentile = data.get('percentile', 50)
            
            # Determine protection status
            if level >= threshold:
                status = 'protective'
                score = 100
            elif level >= threshold * 0.7:
                status = 'moderate'
                score = 60
            else:
                status = 'low'
                score = 30
            
            markers[marker_name] = {
                'antibody_level': level,
                'population_percentile': percentile,
                'status': status,
                'protective_threshold': threshold
            }
            
            total_protection += score
            marker_count += 1
        
        overall_score = int(total_protection / marker_count) if marker_count > 0 else 0
        
        neuro_record = {
            'neuro_id': f"neuro_{datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}",
            'user_id': user_id,
            'test_id': test_id,
            'test_date': current_time,
            'markers': markers,
            'overall_protection_score': overall_score
        }
        
        neuroprotective_table.put_item(Item=neuro_record)
        
    except Exception as e:
        print(f"Error processing neuroprotective data: {str(e)}")
        raise

def calculate_risk_score(markers):
    """Calculate overall autoimmune risk score"""
    high_risk_count = sum(1 for m in markers.values() if m['risk_status'] == 'high')
    elevated_count = sum(1 for m in markers.values() if m['risk_status'] == 'elevated')
    
    score = (high_risk_count * 10) + (elevated_count * 5)
    return min(100, score)

def get_user_immunity_data(user_id):
    """Retrieve all immunity data for a user"""
    try:
        # Get latest metrics
        response = immunity_metrics_table.query(
            IndexName='user-metrics-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        latest_metrics = response['Items'][0] if response['Items'] else None
        
        # Get autoimmune data
        autoimmune_response = autoimmune_table.query(
            IndexName='user-autoimmune-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        # Get allergen data
        allergen_response = allergen_table.query(
            IndexName='user-allergen-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        # Get neuroprotective data
        neuro_response = neuroprotective_table.query(
            IndexName='user-neuro-index',
            KeyConditionExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id},
            ScanIndexForward=False,
            Limit=1
        )
        
        return respond(200, {
            'user_id': user_id,
            'vaccine_metrics': latest_metrics,
            'autoimmune_data': autoimmune_response['Items'][0] if autoimmune_response['Items'] else None,
            'allergen_data': allergen_response['Items'][0] if allergen_response['Items'] else None,
            'neuroprotective_data': neuro_response['Items'][0] if neuro_response['Items'] else None
        })
        
    except Exception as e:
        print(f"Error retrieving immunity data: {str(e)}")
        return respond(500, {'error': 'Failed to retrieve immunity data', 'details': str(e)})

def lambda_handler(event, context):
    """Main Lambda handler"""
    
    print(f"Received event: {json.dumps(event)}")
    
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    path_params = event.get('pathParameters') or {}
    
    try:
        # POST /immunity-data - Ingest test results
        if http_method == 'POST' and path == '/immunity-data':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            if not user_id:
                return respond(400, {'error': 'user_id is required'})
            return ingest_test_results(user_id, body)
        
        # GET /immunity-data/{user_id} - Get user immunity data
        elif http_method == 'GET' and 'user_id' in path_params:
            user_id = path_params['user_id']
            return get_user_immunity_data(user_id)
        
        else:
            return respond(400, {'error': 'Invalid request'})
            
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return respond(500, {'error': 'Internal server error', 'details': str(e)})
