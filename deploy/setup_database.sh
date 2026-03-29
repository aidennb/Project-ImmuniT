#!/bin/bash
# =============================================================================
# ImmuniT Database Setup Script
# Creates schema and loads demo data into PostgreSQL (RDS)
# =============================================================================

set -euo pipefail

DB_HOST="${DB_HOST:-immunit-devt.c1ie608407to.us-west-2.rds.amazonaws.com}"
DB_NAME="${DB_NAME:-test_immunit}"
DB_USER="${DB_USER:-immunit_rw}"
DB_PORT="${DB_PORT:-5432}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== ImmuniT Database Setup ==="
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Step 1: Create schema
echo "[1/2] Creating database schema..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" \
     -f "$PROJECT_ROOT/database/schema.sql"

echo ""

# Step 2: Load demo patient data
echo "[2/2] Loading demo patient data..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" \
     -f "$PROJECT_ROOT/database/seed_demo_patients.sql"

echo ""
echo "=== Database Setup Complete ==="
echo "Demo patients loaded:"
echo "  - Sarah Johnson (moderate risk, 75% vaccine protection)"
echo "  - Michael Chen (HIGH RISK, Poly-GA z-score 41.95, 66% protection)"
