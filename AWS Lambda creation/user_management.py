"""
ImmuniT User Management Lambda Function
Handles CRUD operations for user profiles
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
import uuid

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ.get('USERS_TABLE', 'ImmuniT-Users'))

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def respond(status_code, body):
    """Helper function to format API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def create_user(user_data):
    """Create a new user profile"""
    try:
        # Generate unique user ID
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        current_time = int(datetime.utcnow().timestamp())
        
        # Required fields
        if 'email' not in user_data:
            return respond(400, {'error': 'Email is required'})
        
        # Prepare user record
        user_record = {
            'user_id': user_id,
            'email': user_data['email'],
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'date_of_birth': user_data.get('date_of_birth', ''),
            'nationality': user_data.get('nationality', ''),
            'created_at': current_time,
            'updated_at': current_time,
            'profile_complete': False,
            'consent_hipaa': user_data.get('consent_hipaa', False),
            'consent_research': user_data.get('consent_research', False)
        }
        
        # Save to DynamoDB
        users_table.put_item(Item=user_record)
        
        return respond(201, {
            'message': 'User created successfully',
            'user': user_record
        })
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return respond(500, {'error': 'Failed to create user', 'details': str(e)})

def get_user(user_id):
    """Retrieve user profile by ID"""
    try:
        response = users_table.get_item(Key={'user_id': user_id})
        
        if 'Item' not in response:
            return respond(404, {'error': 'User not found'})
        
        return respond(200, {'user': response['Item']})
        
    except Exception as e:
        print(f"Error retrieving user: {str(e)}")
        return respond(500, {'error': 'Failed to retrieve user', 'details': str(e)})

def update_user(user_id, updates):
    """Update user profile"""
    try:
        # Build update expression
        update_expr = "SET updated_at = :updated_at"
        expr_attr_values = {':updated_at': int(datetime.utcnow().timestamp())}
        
        # Add updatable fields
        updatable_fields = ['first_name', 'last_name', 'date_of_birth', 
                          'nationality', 'consent_hipaa', 'consent_research',
                          'profile_complete']
        
        for field in updatable_fields:
            if field in updates:
                update_expr += f", {field} = :{field}"
                expr_attr_values[f":{field}"] = updates[field]
        
        # Update in DynamoDB
        response = users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values,
            ReturnValues='ALL_NEW'
        )
        
        return respond(200, {
            'message': 'User updated successfully',
            'user': response['Attributes']
        })
        
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return respond(500, {'error': 'Failed to update user', 'details': str(e)})

def delete_user(user_id):
    """Delete user (GDPR compliance)"""
    try:
        users_table.delete_item(Key={'user_id': user_id})
        
        return respond(200, {'message': 'User deleted successfully'})
        
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return respond(500, {'error': 'Failed to delete user', 'details': str(e)})

def lambda_handler(event, context):
    """
    Main Lambda handler function
    Routes requests based on HTTP method and path
    """
    
    print(f"Received event: {json.dumps(event)}")
    
    # Extract HTTP method and path
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    path_params = event.get('pathParameters') or {}
    
    try:
        # POST /users - Create user
        if http_method == 'POST' and path == '/users':
            body = json.loads(event.get('body', '{}'))
            return create_user(body)
        
        # GET /users/{user_id} - Get user
        elif http_method == 'GET' and 'user_id' in path_params:
            user_id = path_params['user_id']
            return get_user(user_id)
        
        # PUT /users/{user_id} - Update user
        elif http_method == 'PUT' and 'user_id' in path_params:
            user_id = path_params['user_id']
            body = json.loads(event.get('body', '{}'))
            return update_user(user_id, body)
        
        # DELETE /users/{user_id} - Delete user
        elif http_method == 'DELETE' and 'user_id' in path_params:
            user_id = path_params['user_id']
            return delete_user(user_id)
        
        else:
            return respond(400, {'error': 'Invalid request'})
            
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return respond(500, {'error': 'Internal server error', 'details': str(e)})

# Example test event for local testing
if __name__ == "__main__":
    # Test create user
    test_event = {
        'httpMethod': 'POST',
        'path': '/users',
        'body': json.dumps({
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': '1990-05-15',
            'nationality': 'United States',
            'consent_hipaa': True
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
