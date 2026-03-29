#!/bin/bash
# =============================================================================
# ImmuniT Lambda Deployment Script
# Packages and deploys the enhanced Lambda handler to AWS
# =============================================================================

set -euo pipefail

LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-immunity-passport-api}"
REGION="${AWS_REGION:-us-west-2}"
PACKAGE_DIR="$(mktemp -d)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== ImmuniT Lambda Deployment ==="
echo "Function: $LAMBDA_FUNCTION_NAME"
echo "Region:   $REGION"
echo ""

# Step 1: Install dependencies
echo "[1/4] Installing dependencies..."
pip install -r "$PROJECT_ROOT/lambda/requirements.txt" -t "$PACKAGE_DIR" --quiet

# Step 2: Copy Lambda handler
echo "[2/4] Packaging Lambda function..."
cp "$PROJECT_ROOT/lambda/lambda_handler.py" "$PACKAGE_DIR/"

# Step 3: Create deployment zip
echo "[3/4] Creating deployment package..."
cd "$PACKAGE_DIR"
zip -r9 "$PROJECT_ROOT/deploy/lambda_package.zip" . --quiet
cd "$PROJECT_ROOT"

# Step 4: Deploy to AWS
echo "[4/4] Deploying to AWS Lambda..."
aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://deploy/lambda_package.zip" \
    --region "$REGION"

echo ""
echo "=== Deployment Complete ==="
echo ""

# Update environment variables (uncomment and fill in password)
# aws lambda update-function-configuration \
#     --function-name "$LAMBDA_FUNCTION_NAME" \
#     --environment "Variables={
#         DB_HOST=immunit-devt.c1ie608407to.us-west-2.rds.amazonaws.com,
#         DB_NAME=test_immunit,
#         DB_USER=immunit_rw,
#         DB_PASSWORD=YOUR_DB_PASSWORD_HERE,
#         DB_PORT=5432
#     }" \
#     --region "$REGION"

# Clean up
rm -rf "$PACKAGE_DIR"
echo "Done. Test with:"
echo "  curl https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod/health"
