# Project ImmuniT

Immunity passport platform powered by PepSeq peptide microarray technology. Provides personalized immune profiling including vaccine protection tracking, autoimmune risk assessment, allergen reactivity mapping, and neuroprotective antibody monitoring.

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Mobile App  │────▶│  API Gateway    │────▶│  Lambda Handler  │
│ (React Native)│    │  (REST + CORS)  │     │  (Python 3.12)   │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                     ┌─────────────────┐              │
                     │  Cognito        │◀─────────────┤
                     │  (Auth/JWT)     │              │
                     └─────────────────┘              │
                                                      ▼
                                             ┌──────────────────┐
                                             │  PostgreSQL (RDS) │
                                             │  9 tables         │
                                             └──────────────────┘
```

**AWS Resources:**
- **API Gateway:** `ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod`
- **Lambda:** `immunity-passport-api`
- **RDS:** `immunit-devt.c1ie608407to.us-west-2.rds.amazonaws.com`
- **Cognito User Pool:** `us-west-2_Tg7giNyV6`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API health check + DB connectivity |
| GET | `/dashboard/summary` | Main dashboard overview with risk flags |
| GET | `/vaccinations` | All vaccine records for user |
| GET | `/vaccines/recommendations` | Booster recommendations by urgency |
| GET | `/vaccines/trends` | Vaccine antibody trend data |
| GET | `/immunity-metrics` | Full immunity score breakdown |
| GET | `/autoimmune-markers` | Autoimmune antibody data with risk levels |
| GET | `/allergens` | Food and environmental allergen reactivity |
| GET | `/neuroprotective-markers` | Cognitive protection scores |
| GET | `/antibody-trends` | All antibody time-series data |
| GET | `/immunity-passports` | Immunity passport records |
| GET | `/risk-score` | Composite risk assessment |
| POST | `/test-results` | Ingest new PepSeq test data |
| POST | `/vaccinations` | Add a vaccine record |

All GET endpoints accept `user_id` via Cognito JWT claims or query parameter.

## Database Schema

9 PostgreSQL tables in `database/schema.sql`:

1. **users** - Core profiles with Cognito integration
2. **test_results** - PepSeq test metadata
3. **vaccine_records** - Vaccination history
4. **immunity_metrics** - Calculated immunity scores (JSONB)
5. **autoimmune_markers** - Autoimmune antibody data (JSONB)
6. **allergen_data** - Food and environmental allergens (JSONB)
7. **neuroprotective_markers** - Cognitive protection markers (JSONB)
8. **immunity_passports** - Verifiable immunity passports
9. **antibody_trends** - Time-series antibody tracking

## Quick Start

### 1. Set up the database

```bash
# Set your DB password
export PGPASSWORD=your_password_here

# Create tables and load demo data
./deploy/setup_database.sh
```

### 2. Deploy Lambda

```bash
# Deploy enhanced handler to AWS
./deploy/deploy.sh
```

### 3. Test the API

```bash
# Health check
curl https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod/health

# Dashboard for demo patient (Sarah Johnson)
curl "https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod/dashboard/summary?user_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# High-risk patient (Michael Chen)
curl "https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod/risk-score?user_id=c3d4e5f6-a7b8-9012-cdef-345678901234"
```

## Demo Patients

| Patient | Risk Level | Vaccine Protection | Key Finding |
|---------|------------|-------------------|-------------|
| Sarah Johnson | Moderate | 75% | Stable immune profile, seasonal pollen allergy |
| Michael Chen | **HIGH** | 66% | Poly-GA z-score **41.95** (C9orf72 ALS/FTD indicator) |

Michael Chen's extreme Poly-GA elevation demonstrates ImmuniT's ability to detect neurodegenerative biomarkers that traditional healthcare misses.

## Project Structure

```
Project-ImmuniT/
├── AWS Lambda creation/    # Original DynamoDB-based Lambda functions
│   ├── immunity_data.py
│   ├── user_management.py
│   ├── vaccine_tracking.py
│   ├── dynamodb_schemas.json
│   └── create_tables.sh
├── database/               # PostgreSQL schema and seed data
│   ├── schema.sql
│   └── seed_demo_patients.sql
├── lambda/                 # Enhanced RDS-backed Lambda handler
│   ├── lambda_handler.py
│   └── requirements.txt
└── deploy/                 # Deployment automation
    ├── deploy.sh
    └── setup_database.sh
```

## Development Timeline

| Phase | Weeks | Status |
|-------|-------|--------|
| Foundation & Backend | 1-4 | **Complete** |
| Mobile App Development | 5-10 | Next |
| Testing & Refinement | 11-13 | Planned |
| Launch Preparation | 14-16 | Planned |

**Team:** Aiden Bingham (Lead), Jon Gallagher (Backend)

## Tech Stack

- **Backend:** Python 3.12, AWS Lambda, API Gateway, PostgreSQL (RDS)
- **Auth:** AWS Cognito (JWT)
- **Mobile:** React Native (planned)
- **Data:** PepSeq peptide microarray analysis
