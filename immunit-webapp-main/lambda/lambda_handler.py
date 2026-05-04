import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from jwt import decode
import boto3
from datetime import datetime
import uuid

# Database connection details
DB_HOST = 'immunit-devt.c1ie608407to.us-west-2.rds.amazonaws.com'
DB_PORT = 5432
DB_NAME = 'test_immunit'
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

# Cognito details
COGNITO_REGION = os.environ.get('COGNITO_REGION', 'us-west-2')
USER_POOL_ID = os.environ.get('USER_POOL_ID', 'us-west-2_Tg7giNyV6')

def verify_cognito_token(token):
    """Verify JWT token from Cognito"""
    try:
        import urllib3
        keys_url = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'
        http = urllib3.PoolManager()
        response = http.request('GET', keys_url)
        keys = json.loads(response.data)
        
        unverified_headers = decode(token, options={"verify_signature": False}, algorithms=["RS256"])
        kid = unverified_headers.get('kid')
        
        key = None
        for k in keys['keys']:
            if k['kid'] == kid:
                key = k
                break
        
        if not key:
            return None
        
        verified = decode(token, key=key, algorithms=["RS256"], audience=None)
        return verified
    except Exception as e:
        print(f"Token verification failed: {str(e)}")
        return None

def get_db_connection():
    """Establish database connection"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
        return conn
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        raise

def query_data(query, params=None):
    """Execute SELECT query and return results"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    except Exception as e:
        print(f"Query execution failed: {str(e)}")
        raise
    finally:
        conn.close()

def execute_insert_update(query, params=None):
    """Execute insert/update/delete query"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query, params)
        
        if cursor.description:
            results = cursor.fetchall()
            results_list = [dict(row) for row in results]
        else:
            results_list = []
        
        conn.commit()
        cursor.close()
        return results_list
    except Exception as e:
        conn.rollback()
        print(f"Query execution failed: {str(e)}")
        raise
    finally:
        conn.close()

def response(status_code, body):
    """Format HTTP response"""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }

def lambda_handler(event, context):
    """Main Lambda handler"""
    try:
        # Verify authorization
        auth_header = event.get('headers', {}).get('Authorization')
        if not auth_header:
            return response(401, {'error': 'Missing authorization header'})
        
        token = auth_header.replace('Bearer ', '')
        user = verify_cognito_token(token)
        if not user:
            return response(401, {'error': 'Invalid token'})
        
        user_id = user.get('sub')
        path = event.get('path', '')
        method = event.get('httpMethod', 'GET')
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        
        # ALLERGENS
        if path == '/allergens' and method == 'GET':
            results = query_data('SELECT * FROM public.allergens WHERE user_id = %s ORDER BY recorded_at DESC', (user_id,))
            return response(200, results)
        
        elif path == '/allergens' and method == 'POST':
            record_id = str(uuid.uuid4())
            query = '''INSERT INTO public.allergens 
                       (id, user_id, allergen_type, allergen_name, sensitivity_level, recorded_at, symptoms_flagged) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *'''
            results = execute_insert_update(query, (record_id, user_id, body.get('allergen_type'), 
                                                     body.get('allergen_name'), body.get('sensitivity_level'),
                                                     body.get('recorded_at', datetime.now().strftime('%Y-%m-%d')),
                                                     body.get('symptoms_flagged', [])))
            return response(201, results[0] if results else {})
        
        elif path.startswith('/allergens/') and method == 'GET':
            record_id = path.split('/')[-1]
            results = query_data('SELECT * FROM public.allergens WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/allergens/') and method == 'PUT':
            record_id = path.split('/')[-1]
            query = '''UPDATE public.allergens 
                       SET allergen_type = COALESCE(%s, allergen_type),
                           allergen_name = COALESCE(%s, allergen_name),
                           sensitivity_level = COALESCE(%s, sensitivity_level),
                           symptoms_flagged = COALESCE(%s, symptoms_flagged)
                       WHERE id = %s AND user_id = %s RETURNING *'''
            results = execute_insert_update(query, (body.get('allergen_type'), body.get('allergen_name'),
                                                    body.get('sensitivity_level'), body.get('symptoms_flagged'),
                                                    record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/allergens/') and method == 'DELETE':
            record_id = path.split('/')[-1]
            execute_insert_update('DELETE FROM public.allergens WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, {'message': 'Deleted'})
        
        # ANTIBODY TRENDS
        elif path == '/antibody-trends' and method == 'GET':
            results = query_data('SELECT * FROM public.antibody_trends WHERE user_id = %s ORDER BY recorded_at DESC', (user_id,))
            return response(200, results)
        
        elif path == '/antibody-trends' and method == 'POST':
            record_id = str(uuid.uuid4())
            query = '''INSERT INTO public.antibody_trends 
                       (id, user_id, antibody_name, titer_value, unit, recorded_at) 
                       VALUES (%s, %s, %s, %s, %s, %s) RETURNING *'''
            results = execute_insert_update(query, (record_id, user_id, body.get('antibody_name'),
                                                    body.get('titer_value'), body.get('unit'),
                                                    body.get('recorded_at', datetime.now().strftime('%Y-%m-%d'))))
            return response(201, results[0] if results else {})
        
        elif path.startswith('/antibody-trends/') and method == 'GET':
            record_id = path.split('/')[-1]
            results = query_data('SELECT * FROM public.antibody_trends WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/antibody-trends/') and method == 'PUT':
            record_id = path.split('/')[-1]
            query = '''UPDATE public.antibody_trends 
                       SET antibody_name = COALESCE(%s, antibody_name),
                           titer_value = COALESCE(%s, titer_value),
                           unit = COALESCE(%s, unit)
                       WHERE id = %s AND user_id = %s RETURNING *'''
            results = execute_insert_update(query, (body.get('antibody_name'), body.get('titer_value'),
                                                    body.get('unit'), record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/antibody-trends/') and method == 'DELETE':
            record_id = path.split('/')[-1]
            execute_insert_update('DELETE FROM public.antibody_trends WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, {'message': 'Deleted'})
        
        # AUTOIMMUNE MARKERS
        elif path == '/autoimmune-markers' and method == 'GET':
            results = query_data('SELECT * FROM public.autoimmune_markers WHERE user_id = %s ORDER BY date_recorded DESC', (user_id,))
            return response(200, results)
        
        elif path == '/autoimmune-markers' and method == 'POST':
            record_id = str(uuid.uuid4())
            query = '''INSERT INTO public.autoimmune_markers 
                       (id, user_id, marker_name, value, unit, date_recorded, clinical_flag, reference_range) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *'''
            results = execute_insert_update(query, (record_id, user_id, body.get('marker_name'), body.get('value'),
                                                    body.get('unit'), body.get('date_recorded', datetime.now().strftime('%Y-%m-%d')),
                                                    body.get('clinical_flag'), body.get('reference_range')))
            return response(201, results[0] if results else {})
        
        elif path.startswith('/autoimmune-markers/') and method == 'GET':
            record_id = path.split('/')[-1]
            results = query_data('SELECT * FROM public.autoimmune_markers WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/autoimmune-markers/') and method == 'PUT':
            record_id = path.split('/')[-1]
            query = '''UPDATE public.autoimmune_markers 
                       SET marker_name = COALESCE(%s, marker_name),
                           value = COALESCE(%s, value),
                           unit = COALESCE(%s, unit),
                           clinical_flag = COALESCE(%s, clinical_flag),
                           reference_range = COALESCE(%s, reference_range)
                       WHERE id = %s AND user_id = %s RETURNING *'''
            results = execute_insert_update(query, (body.get('marker_name'), body.get('value'), body.get('unit'),
                                                    body.get('clinical_flag'), body.get('reference_range'),
                                                    record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/autoimmune-markers/') and method == 'DELETE':
            record_id = path.split('/')[-1]
            execute_insert_update('DELETE FROM public.autoimmune_markers WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, {'message': 'Deleted'})
        
        # VACCINATIONS
        elif path == '/vaccinations' and method == 'GET':
            results = query_data('SELECT * FROM public.vaccinations WHERE user_id = %s ORDER BY date_administered DESC', (user_id,))
            return response(200, results)
        
        elif path == '/vaccinations' and method == 'POST':
            record_id = str(uuid.uuid4())
            query = '''INSERT INTO public.vaccinations 
                       (id, user_id, vaccine_name, date_administered, dose_number, manufacturer, status) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *'''
            results = execute_insert_update(query, (record_id, user_id, body.get('vaccine_name'), body.get('date_administered'),
                                                    body.get('dose_number'), body.get('manufacturer'), body.get('status')))
            return response(201, results[0] if results else {})
        
        elif path.startswith('/vaccinations/') and method == 'GET':
            record_id = path.split('/')[-1]
            results = query_data('SELECT * FROM public.vaccinations WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/vaccinations/') and method == 'PUT':
            record_id = path.split('/')[-1]
            query = '''UPDATE public.vaccinations 
                       SET vaccine_name = COALESCE(%s, vaccine_name),
                           dose_number = COALESCE(%s, dose_number),
                           manufacturer = COALESCE(%s, manufacturer),
                           status = COALESCE(%s, status)
                       WHERE id = %s AND user_id = %s RETURNING *'''
            results = execute_insert_update(query, (body.get('vaccine_name'), body.get('dose_number'),
                                                    body.get('manufacturer'), body.get('status'),
                                                    record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/vaccinations/') and method == 'DELETE':
            record_id = path.split('/')[-1]
            execute_insert_update('DELETE FROM public.vaccinations WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, {'message': 'Deleted'})
        
        # IMMUNITY PASSPORT SNAPSHOTS
        elif path == '/immunity-passports' and method == 'GET':
            results = query_data('SELECT * FROM public.immunity_passport_snapshots WHERE user_id = %s ORDER BY snapshot_date DESC', (user_id,))
            return response(200, results)
        
        elif path == '/immunity-passports' and method == 'POST':
            record_id = str(uuid.uuid4())
            query = '''INSERT INTO public.immunity_passport_snapshots 
                       (id, user_id, snapshot_date, pdf_url, includes_sections, shared_with_email) 
                       VALUES (%s, %s, %s, %s, %s, %s) RETURNING *'''
            results = execute_insert_update(query, (record_id, user_id, body.get('snapshot_date', datetime.now().strftime('%Y-%m-%d')),
                                                    body.get('pdf_url'), body.get('includes_sections', []),
                                                    body.get('shared_with_email')))
            return response(201, results[0] if results else {})
        
        elif path.startswith('/immunity-passports/') and method == 'GET':
            record_id = path.split('/')[-1]
            results = query_data('SELECT * FROM public.immunity_passport_snapshots WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/immunity-passports/') and method == 'PUT':
            record_id = path.split('/')[-1]
            query = '''UPDATE public.immunity_passport_snapshots 
                       SET pdf_url = COALESCE(%s, pdf_url),
                           includes_sections = COALESCE(%s, includes_sections),
                           shared_with_email = COALESCE(%s, shared_with_email)
                       WHERE id = %s AND user_id = %s RETURNING *'''
            results = execute_insert_update(query, (body.get('pdf_url'), body.get('includes_sections'),
                                                    body.get('shared_with_email'), record_id, user_id))
            return response(200, results[0]) if results else response(404, {'error': 'Not found'})
        
        elif path.startswith('/immunity-passports/') and method == 'DELETE':
            record_id = path.split('/')[-1]
            execute_insert_update('DELETE FROM public.immunity_passport_snapshots WHERE id = %s AND user_id = %s', (record_id, user_id))
            return response(200, {'message': 'Deleted'})
        
        else:
            return response(404, {'error': 'Endpoint not found'})
    
    except Exception as e:
        return response(500, {'error': str(e)})

