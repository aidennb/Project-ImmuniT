#!/bin/bash
# ImmuniT DynamoDB Table Creation Script
# Run this script to create all required tables in AWS

set -e

REGION="us-west-2"
BILLING_MODE="PAY_PER_REQUEST"

echo "Creating ImmuniT DynamoDB tables in region: $REGION"
echo "================================================"

# 1. Users Table
echo "Creating ImmuniT-Users table..."
aws dynamodb create-table \
  --table-name ImmuniT-Users \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"email-index\",
      \"KeySchema\": [{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 2. Test Results Table
echo "Creating ImmuniT-TestResults table..."
aws dynamodb create-table \
  --table-name ImmuniT-TestResults \
  --attribute-definitions \
    AttributeName=test_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=test_date,AttributeType=N \
  --key-schema \
    AttributeName=test_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-date-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"test_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 3. Vaccine Records Table
echo "Creating ImmuniT-VaccineRecords table..."
aws dynamodb create-table \
  --table-name ImmuniT-VaccineRecords \
  --attribute-definitions \
    AttributeName=record_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=admin_date,AttributeType=N \
  --key-schema \
    AttributeName=record_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-vaccine-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"admin_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 4. Immunity Metrics Table
echo "Creating ImmuniT-ImmunityMetrics table..."
aws dynamodb create-table \
  --table-name ImmuniT-ImmunityMetrics \
  --attribute-definitions \
    AttributeName=metric_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=calculated_date,AttributeType=N \
  --key-schema \
    AttributeName=metric_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-metrics-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"calculated_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 5. Autoimmune Markers Table
echo "Creating ImmuniT-AutoimmuneMarkers table..."
aws dynamodb create-table \
  --table-name ImmuniT-AutoimmuneMarkers \
  --attribute-definitions \
    AttributeName=marker_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=test_date,AttributeType=N \
  --key-schema \
    AttributeName=marker_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-autoimmune-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"test_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 6. Allergen Data Table
echo "Creating ImmuniT-AllergenData table..."
aws dynamodb create-table \
  --table-name ImmuniT-AllergenData \
  --attribute-definitions \
    AttributeName=allergen_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=test_date,AttributeType=N \
  --key-schema \
    AttributeName=allergen_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-allergen-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"test_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

# 7. Neuroprotective Markers Table
echo "Creating ImmuniT-NeuroprotectiveMarkers table..."
aws dynamodb create-table \
  --table-name ImmuniT-NeuroprotectiveMarkers \
  --attribute-definitions \
    AttributeName=neuro_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=test_date,AttributeType=N \
  --key-schema \
    AttributeName=neuro_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"user-neuro-index\",
      \"KeySchema\": [
        {\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"},
        {\"AttributeName\":\"test_date\",\"KeyType\":\"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\":\"ALL\"}
    }]" \
  --billing-mode $BILLING_MODE \
  --region $REGION

echo ""
echo "================================================"
echo "All tables created successfully!"
echo "Please wait a few minutes for tables to become active."
echo ""
echo "Check table status with:"
echo "aws dynamodb describe-table --table-name ImmuniT-Users --region $REGION"
