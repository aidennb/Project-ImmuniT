"""
ImmuniT Enhanced Lambda Handler
Unified API handler for immunity passport platform
Connects to PostgreSQL (RDS) with Cognito authentication
"""

import json
import os
import logging
from datetime import datetime, date
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Database configuration (set via Lambda environment variables)
DB_HOST = os.environ.get('DB_HOST', 'immunit-devt.c1ie608407to.us-west-2.rds.amazonaws.com')
DB_NAME = os.environ.get('DB_NAME', 'test_immunit')
DB_USER = os.environ.get('DB_USER', 'immunit_rw')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_PORT = os.environ.get('DB_PORT', '5432')


def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        connect_timeout=5,
    )


class JSONEncoder(json.JSONEncoder):
    """Handle datetime and Decimal serialization."""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def respond(status_code, body):
    """Format API Gateway response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        },
        'body': json.dumps(body, cls=JSONEncoder),
    }


def get_user_id_from_event(event):
    """Extract user_id from Cognito authorizer or path parameters."""
    # Try Cognito claims first
    claims = (event.get('requestContext', {})
              .get('authorizer', {})
              .get('claims', {}))
    cognito_sub = claims.get('sub')

    if cognito_sub:
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT user_id FROM users WHERE cognito_sub = %s",
                    (cognito_sub,),
                )
                row = cur.fetchone()
                if row:
                    return str(row['user_id'])
        finally:
            conn.close()

    # Fall back to path parameters or query string
    path_params = event.get('pathParameters') or {}
    query_params = event.get('queryStringParameters') or {}
    return path_params.get('user_id') or query_params.get('user_id')


# ---------------------------------------------------------------------------
# Dashboard endpoints
# ---------------------------------------------------------------------------

def get_dashboard_summary(user_id):
    """GET /dashboard/summary - Main dashboard overview."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Latest immunity metrics
            cur.execute("""
                SELECT vaccine_data, overall_score, risk_level, calculated_date
                FROM immunity_metrics
                WHERE user_id = %s
                ORDER BY calculated_date DESC LIMIT 1
            """, (user_id,))
            metrics = cur.fetchone()

            # Vaccine summary
            cur.execute("""
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN protection_status = 'protected' THEN 1 ELSE 0 END) as protected,
                       SUM(CASE WHEN protection_status = 'waning' THEN 1 ELSE 0 END) as waning,
                       SUM(CASE WHEN protection_status = 'not_protected' THEN 1 ELSE 0 END) as unprotected
                FROM vaccine_records WHERE user_id = %s
            """, (user_id,))
            vaccines = cur.fetchone()

            # Neuroprotective score
            cur.execute("""
                SELECT overall_protection_score, markers
                FROM neuroprotective_markers
                WHERE user_id = %s
                ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            neuro = cur.fetchone()

            # Autoimmune risk
            cur.execute("""
                SELECT overall_risk_score, flagged_markers
                FROM autoimmune_markers
                WHERE user_id = %s
                ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            autoimmune = cur.fetchone()

            # User info
            cur.execute("""
                SELECT first_name, last_name FROM users WHERE user_id = %s
            """, (user_id,))
            user = cur.fetchone()

            # Build risk flags
            risk_flags = []
            if neuro and neuro.get('markers'):
                markers = neuro['markers'] if isinstance(neuro['markers'], dict) else {}
                for name, data in markers.items():
                    if isinstance(data, dict) and data.get('status') in ('critical_elevation', 'low'):
                        z = data.get('z_score', 0)
                        if isinstance(z, (int, float)) and (z > 3 or z < -2):
                            risk_flags.append({
                                'marker': name,
                                'z_score': z,
                                'status': data['status'],
                                'note': data.get('clinical_note', ''),
                            })

            return respond(200, {
                'user': user,
                'overall_score': metrics['overall_score'] if metrics else 0,
                'risk_level': metrics['risk_level'] if metrics else 'unknown',
                'vaccine_summary': vaccines,
                'neuro_protection_score': neuro['overall_protection_score'] if neuro else 0,
                'autoimmune_risk_score': autoimmune['overall_risk_score'] if autoimmune else 0,
                'flagged_autoimmune': autoimmune['flagged_markers'] if autoimmune else [],
                'risk_flags': risk_flags,
                'last_test_date': metrics['calculated_date'] if metrics else None,
            })
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Vaccine endpoints
# ---------------------------------------------------------------------------

def get_vaccinations(user_id):
    """GET /vaccinations - List all vaccine records."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT record_id, vaccine_name, vaccine_type, manufacturer,
                       admin_date, next_due_date, dose_number,
                       protection_status, efficacy_percentile
                FROM vaccine_records
                WHERE user_id = %s
                ORDER BY admin_date DESC
            """, (user_id,))
            records = cur.fetchall()
            return respond(200, {'vaccinations': records, 'total': len(records)})
    finally:
        conn.close()


def get_vaccine_recommendations(user_id):
    """GET /vaccines/recommendations - Booster recommendations."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT vaccine_name, protection_status, efficacy_percentile,
                       admin_date, next_due_date
                FROM vaccine_records
                WHERE user_id = %s
                ORDER BY admin_date DESC
            """, (user_id,))
            records = cur.fetchall()

            recommendations = []
            today = date.today()

            for rec in records:
                next_due = rec.get('next_due_date')
                status = rec['protection_status']

                if status == 'not_protected':
                    urgency, priority = 'urgent', 1
                    msg = 'Booster needed immediately'
                elif status == 'waning':
                    urgency, priority = 'high', 2
                    msg = 'Booster recommended within 1 month'
                elif next_due and next_due <= today:
                    urgency, priority = 'moderate', 3
                    msg = 'Booster overdue'
                else:
                    urgency, priority = 'none', 5
                    msg = 'Protection adequate'

                recommendations.append({
                    'vaccine_name': rec['vaccine_name'],
                    'current_status': status,
                    'efficacy_percentile': rec['efficacy_percentile'],
                    'last_dose_date': rec['admin_date'],
                    'next_due_date': next_due,
                    'urgency': urgency,
                    'priority': priority,
                    'recommendation': msg,
                })

            recommendations.sort(key=lambda x: x['priority'])

            return respond(200, {
                'recommendations': recommendations,
                'urgent_count': sum(1 for r in recommendations if r['urgency'] == 'urgent'),
                'high_priority_count': sum(1 for r in recommendations if r['urgency'] == 'high'),
            })
    finally:
        conn.close()


def get_vaccine_trends(user_id):
    """GET /vaccines/trends - Antibody trend data for vaccines."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT marker_name, measurement_date, value, z_score, percentile, unit
                FROM antibody_trends
                WHERE user_id = %s AND marker_category = 'vaccine'
                ORDER BY marker_name, measurement_date
            """, (user_id,))
            rows = cur.fetchall()

            trends = {}
            for row in rows:
                name = row['marker_name']
                if name not in trends:
                    trends[name] = []
                trends[name].append({
                    'date': row['measurement_date'],
                    'value': row['value'],
                    'z_score': row['z_score'],
                    'percentile': row['percentile'],
                    'unit': row['unit'],
                })

            return respond(200, {'vaccine_trends': trends})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Immunity metrics endpoints
# ---------------------------------------------------------------------------

def get_immunity_metrics(user_id):
    """GET /immunity-metrics - Full immunity metrics."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT metric_type, vaccine_data, overall_score, risk_level, calculated_date
                FROM immunity_metrics
                WHERE user_id = %s
                ORDER BY calculated_date DESC LIMIT 1
            """, (user_id,))
            metrics = cur.fetchone()

            if not metrics:
                return respond(404, {'error': 'No immunity metrics found'})

            return respond(200, {'immunity_metrics': metrics})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Autoimmune markers endpoints
# ---------------------------------------------------------------------------

def get_autoimmune_markers(user_id):
    """GET /autoimmune-markers - Autoimmune antibody data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT markers, overall_risk_score, flagged_markers, test_date
                FROM autoimmune_markers
                WHERE user_id = %s
                ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            data = cur.fetchone()

            if not data:
                return respond(404, {'error': 'No autoimmune data found'})

            return respond(200, {'autoimmune_data': data})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Allergen endpoints
# ---------------------------------------------------------------------------

def get_allergens(user_id):
    """GET /allergens - Allergen reactivity data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT food_allergens, environmental_allergens, test_date
                FROM allergen_data
                WHERE user_id = %s
                ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            data = cur.fetchone()

            if not data:
                return respond(404, {'error': 'No allergen data found'})

            return respond(200, {'allergen_data': data})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Neuroprotective endpoints
# ---------------------------------------------------------------------------

def get_neuroprotective_markers(user_id):
    """GET /neuroprotective-markers - Cognitive protection data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT markers, overall_protection_score, test_date
                FROM neuroprotective_markers
                WHERE user_id = %s
                ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            data = cur.fetchone()

            if not data:
                return respond(404, {'error': 'No neuroprotective data found'})

            return respond(200, {'neuroprotective_data': data})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Antibody trends endpoints
# ---------------------------------------------------------------------------

def get_antibody_trends(user_id):
    """GET /antibody-trends - All antibody trend data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT marker_name, marker_category, measurement_date,
                       value, z_score, percentile, unit
                FROM antibody_trends
                WHERE user_id = %s
                ORDER BY marker_category, marker_name, measurement_date
            """, (user_id,))
            rows = cur.fetchall()

            trends = {}
            for row in rows:
                category = row['marker_category']
                name = row['marker_name']
                key = f"{category}/{name}"
                if key not in trends:
                    trends[key] = {
                        'marker_name': name,
                        'category': category,
                        'data_points': [],
                    }
                trends[key]['data_points'].append({
                    'date': row['measurement_date'],
                    'value': row['value'],
                    'z_score': row['z_score'],
                    'percentile': row['percentile'],
                    'unit': row['unit'],
                })

            return respond(200, {'antibody_trends': list(trends.values())})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Immunity passport endpoints
# ---------------------------------------------------------------------------

def get_immunity_passports(user_id):
    """GET /immunity-passports - Immunity passport data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT passport_id, issued_date, expiry_date, status,
                       vaccine_summary, immunity_summary, verified_by
                FROM immunity_passports
                WHERE user_id = %s
                ORDER BY issued_date DESC
            """, (user_id,))
            passports = cur.fetchall()

            return respond(200, {'passports': passports, 'total': len(passports)})
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Risk scoring
# ---------------------------------------------------------------------------

def get_risk_score(user_id):
    """GET /risk-score - Composite risk assessment."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Vaccine score
            cur.execute("""
                SELECT overall_score FROM immunity_metrics
                WHERE user_id = %s ORDER BY calculated_date DESC LIMIT 1
            """, (user_id,))
            vaccine_row = cur.fetchone()
            vaccine_score = float(vaccine_row['overall_score']) if vaccine_row else 0

            # Autoimmune risk
            cur.execute("""
                SELECT overall_risk_score FROM autoimmune_markers
                WHERE user_id = %s ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            auto_row = cur.fetchone()
            autoimmune_risk = float(auto_row['overall_risk_score']) if auto_row else 0

            # Neuroprotective score
            cur.execute("""
                SELECT overall_protection_score, markers FROM neuroprotective_markers
                WHERE user_id = %s ORDER BY test_date DESC LIMIT 1
            """, (user_id,))
            neuro_row = cur.fetchone()
            neuro_score = float(neuro_row['overall_protection_score']) if neuro_row else 0

            # Check for critical markers
            critical_flags = []
            if neuro_row and neuro_row.get('markers'):
                markers = neuro_row['markers'] if isinstance(neuro_row['markers'], dict) else {}
                for name, data in markers.items():
                    if isinstance(data, dict):
                        z = data.get('z_score', 0)
                        if isinstance(z, (int, float)) and abs(z) > 3:
                            critical_flags.append({
                                'marker': name,
                                'z_score': z,
                                'status': data.get('status', 'unknown'),
                                'clinical_note': data.get('clinical_note', ''),
                            })

            # Composite risk (higher = more at risk)
            # vaccine_score is protection (higher = better), invert for risk
            composite_risk = (
                (100 - vaccine_score) * 0.3
                + autoimmune_risk * 0.3
                + (100 - neuro_score) * 0.4
            )

            if critical_flags:
                composite_risk = min(100, composite_risk + 20)

            if composite_risk >= 70:
                level = 'critical'
            elif composite_risk >= 50:
                level = 'high'
            elif composite_risk >= 30:
                level = 'moderate'
            else:
                level = 'low'

            return respond(200, {
                'composite_risk_score': round(composite_risk, 1),
                'risk_level': level,
                'components': {
                    'vaccine_protection': vaccine_score,
                    'autoimmune_risk': autoimmune_risk,
                    'neuroprotective_score': neuro_score,
                },
                'critical_flags': critical_flags,
            })
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Data ingestion
# ---------------------------------------------------------------------------

def ingest_test_results(event):
    """POST /test-results - Ingest new PepSeq test data."""
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id')
    if not user_id:
        return respond(400, {'error': 'user_id is required'})

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO test_results (user_id, sample_id, processing_status, peptide_count, quality_score)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING test_id
            """, (
                user_id,
                body.get('sample_id', ''),
                'processing',
                body.get('peptide_count', 0),
                body.get('quality_score', 0.0),
            ))
            test_id = cur.fetchone()['test_id']
            conn.commit()

            return respond(201, {
                'message': 'Test results ingested',
                'test_id': str(test_id),
            })
    finally:
        conn.close()


def add_vaccine_record(event):
    """POST /vaccinations - Add a vaccine record."""
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id')
    if not user_id:
        return respond(400, {'error': 'user_id is required'})

    vaccine_name = body.get('vaccine_name')
    if not vaccine_name:
        return respond(400, {'error': 'vaccine_name is required'})

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO vaccine_records
                    (user_id, vaccine_name, vaccine_type, manufacturer,
                     admin_date, next_due_date, batch_number, location,
                     provider, dose_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING record_id
            """, (
                user_id, vaccine_name,
                body.get('vaccine_type', ''),
                body.get('manufacturer', ''),
                body.get('admin_date', date.today()),
                body.get('next_due_date'),
                body.get('batch_number', ''),
                body.get('location', ''),
                body.get('provider', ''),
                body.get('dose_number', 1),
            ))
            record_id = cur.fetchone()['record_id']
            conn.commit()

            return respond(201, {
                'message': 'Vaccine record added',
                'record_id': str(record_id),
            })
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def health_check():
    """GET /health - API health check."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.close()
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return respond(200, {
        'status': 'healthy',
        'database': db_status,
        'version': '2.0.0',
        'timestamp': datetime.utcnow().isoformat(),
    })


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

ROUTES = {
    ('GET',  '/health'):                   lambda e, uid: health_check(),
    ('GET',  '/dashboard/summary'):        lambda e, uid: get_dashboard_summary(uid),
    ('GET',  '/vaccinations'):             lambda e, uid: get_vaccinations(uid),
    ('GET',  '/vaccines/recommendations'): lambda e, uid: get_vaccine_recommendations(uid),
    ('GET',  '/vaccines/trends'):          lambda e, uid: get_vaccine_trends(uid),
    ('GET',  '/immunity-metrics'):         lambda e, uid: get_immunity_metrics(uid),
    ('GET',  '/autoimmune-markers'):       lambda e, uid: get_autoimmune_markers(uid),
    ('GET',  '/allergens'):                lambda e, uid: get_allergens(uid),
    ('GET',  '/neuroprotective-markers'):  lambda e, uid: get_neuroprotective_markers(uid),
    ('GET',  '/antibody-trends'):          lambda e, uid: get_antibody_trends(uid),
    ('GET',  '/immunity-passports'):       lambda e, uid: get_immunity_passports(uid),
    ('GET',  '/risk-score'):               lambda e, uid: get_risk_score(uid),
    ('POST', '/test-results'):             lambda e, uid: ingest_test_results(e),
    ('POST', '/vaccinations'):             lambda e, uid: add_vaccine_record(e),
}


def lambda_handler(event, context):
    """Main Lambda entry point."""
    logger.info("Event: %s", json.dumps(event, default=str))

    method = event.get('httpMethod', '')
    path = event.get('path', '')

    # Handle CORS preflight
    if method == 'OPTIONS':
        return respond(200, {})

    # Route lookup
    handler = ROUTES.get((method, path))
    if not handler:
        return respond(404, {
            'error': 'Not found',
            'available_endpoints': [
                f"{m} {p}" for (m, p) in sorted(ROUTES.keys())
            ],
        })

    # Get user_id for authenticated endpoints
    user_id = None
    if path != '/health':
        user_id = get_user_id_from_event(event)
        if not user_id and method == 'GET':
            return respond(401, {'error': 'user_id required (via auth or query param)'})

    try:
        return handler(event, user_id)
    except Exception as e:
        logger.exception("Handler error")
        return respond(500, {'error': 'Internal server error', 'details': str(e)})
