#!/bin/bash

#############################################################################
# Immunity Passport - Complete Deployment Script
# This script automates the deployment of Lambda, API Gateway, and Frontend
#############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
LAMBDA_FUNCTION_NAME="immunity-passport-api"
API_NAME="immunity-passport-api"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
VPC_SUBNET_IDS="${VPC_SUBNET_IDS}"
VPC_SECURITY_GROUP_IDS="${VPC_SECURITY_GROUP_IDS}"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Immunity Passport Deployment Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# Check required environment variables
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}✗ DB_PASSWORD environment variable not set${NC}"
    exit 1
fi

if [ -z "$VPC_SUBNET_IDS" ] || [ -z "$VPC_SECURITY_GROUP_IDS" ]; then
    echo -e "${RED}✗ VPC_SUBNET_IDS and VPC_SECURITY_GROUP_IDS must be set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Required environment variables set${NC}"

# Step 1: Create IAM Role
echo -e "\n${YELLOW}Step 1: Creating IAM Role...${NC}"

ROLE_ARN=$(aws iam get-role \
  --role-name lambda-immunity-passport-role \
  --query 'Role.Arn' \
  --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating new role..."
    ROLE_ARN=$(aws iam create-role \
      --role-name lambda-immunity-passport-role \
      --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": {"Service": "lambda.amazonaws.com"},
          "Action": "sts:AssumeRole"
        }]
      }' \
      --query 'Role.Arn' \
      --output text)
    
    # Attach policies
    aws iam attach-role-policy \
      --role-name lambda-immunity-passport-role \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
    
    aws iam attach-role-policy \
      --role-name lambda-immunity-passport-role \
      --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
    
    sleep 10  # Wait for role to be available
fi

echo -e "${GREEN}✓ IAM Role ARN: ${ROLE_ARN}${NC}"

# Step 2: Create Lambda Layer
echo -e "\n${YELLOW}Step 2: Creating Lambda Layer...${NC}"

mkdir -p python
pip install psycopg2-binary PyJWT urllib3 boto3 -t python/ --quiet

zip -r -q lambda_layer.zip python/

LAYER_ARN=$(aws lambda publish-layer-version \
  --layer-name immunity-passport-dependencies \
  --zip-file fileb://lambda_layer.zip \
  --compatible-runtimes python3.11 \
  --region ${AWS_REGION} \
  --query 'LayerVersionArn' \
  --output text)

echo -e "${GREEN}✓ Lambda Layer ARN: ${LAYER_ARN}${NC}"

# Step 3: Deploy Lambda Function
echo -e "\n${YELLOW}Step 3: Deploying Lambda Function...${NC}"

zip -r -q lambda_function.zip lambda_handler.py

LAMBDA_ARN=$(aws lambda get-function \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --region ${AWS_REGION} \
  --query 'Configuration.FunctionArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$LAMBDA_ARN" ]; then
    echo "Creating new Lambda function..."
    LAMBDA_ARN=$(aws lambda create-function \
      --function-name ${LAMBDA_FUNCTION_NAME} \
      --runtime python3.11 \
      --role ${ROLE_ARN} \
      --handler lambda_handler.lambda_handler \
      --zip-file fileb://lambda_function.zip \
      --timeout 30 \
      --memory-size 256 \
      --vpc-config SubnetIds=${VPC_SUBNET_IDS},SecurityGroupIds=${VPC_SECURITY_GROUP_IDS} \
      --layers ${LAYER_ARN} \
      --environment Variables="{DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD}}" \
      --region ${AWS_REGION} \
      --query 'FunctionArn' \
      --output text)
else
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
      --function-name ${LAMBDA_FUNCTION_NAME} \
      --zip-file fileb://lambda_function.zip \
      --region ${AWS_REGION}
    
    aws lambda update-function-configuration \
      --function-name ${LAMBDA_FUNCTION_NAME} \
      --timeout 30 \
      --memory-size 256 \
      --environment Variables="{DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD}}" \
      --region ${AWS_REGION}
fi

echo -e "${GREEN}✓ Lambda ARN: ${LAMBDA_ARN}${NC}"

# Step 4: Create API Gateway
echo -e "\n${YELLOW}Step 4: Creating API Gateway...${NC}"

API_ID=$(aws apigateway get-rest-apis \
  --region ${AWS_REGION} \
  --query "items[?name=='${API_NAME}'].id" \
  --output text 2>/dev/null || echo "")

if [ -z "$API_ID" ]; then
    echo "Creating new REST API..."
    API_ID=$(aws apigateway create-rest-api \
      --name ${API_NAME} \
      --description "API for Immunity Passport application" \
      --endpoint-configuration types=REGIONAL \
      --region ${AWS_REGION} \
      --query 'id' \
      --output text)
fi

echo -e "${GREEN}✓ API ID: ${API_ID}${NC}"

# Step 5: Get Root Resource
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id ${API_ID} \
  --region ${AWS_REGION} \
  --query 'items[0].id' \
  --output text)

echo -e "${GREEN}✓ Root Resource ID: ${ROOT_ID}${NC}"

# Step 6: Define function to create resources with methods
echo -e "\n${YELLOW}Step 5: Creating API Resources...${NC}"

create_resource_with_methods() {
    local resource_path=$1
    local parent_id=$2
    
    # Create resource if it doesn't exist
    RESOURCE_ID=$(aws apigateway get-resources \
      --rest-api-id ${API_ID} \
      --region ${AWS_REGION} \
      --query "items[?path=='${resource_path}'].id" \
      --output text 2>/dev/null || echo "")
    
    if [ -z "$RESOURCE_ID" ]; then
        RESOURCE_ID=$(aws apigateway create-resource \
          --rest-api-id ${API_ID} \
          --parent-id ${parent_id} \
          --path-part $(basename ${resource_path}) \
          --region ${AWS_REGION} \
          --query 'id' \
          --output text)
    fi
    
    echo "  ✓ Resource: ${resource_path} (${RESOURCE_ID})"
    
    # Create methods for each HTTP verb
    for method in GET POST PUT DELETE; do
        METHOD_EXISTS=$(aws apigateway get-method \
          --rest-api-id ${API_ID} \
          --resource-id ${RESOURCE_ID} \
          --http-method ${method} \
          --region ${AWS_REGION} \
          --query 'httpMethod' \
          --output text 2>/dev/null || echo "")
        
        if [ -z "$METHOD_EXISTS" ]; then
            aws apigateway put-method \
              --rest-api-id ${API_ID} \
              --resource-id ${RESOURCE_ID} \
              --http-method ${method} \
              --authorization-type NONE \
              --region ${AWS_REGION} > /dev/null
            
            aws apigateway put-integration \
              --rest-api-id ${API_ID} \
              --resource-id ${RESOURCE_ID} \
              --http-method ${method} \
              --type AWS_PROXY \
              --integration-http-method POST \
              --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations \
              --region ${AWS_REGION} > /dev/null
        fi
    done
    
    # Add OPTIONS method for CORS
    aws apigateway put-method \
      --rest-api-id ${API_ID} \
      --resource-id ${RESOURCE_ID} \
      --http-method OPTIONS \
      --authorization-type NONE \
      --region ${AWS_REGION} > /dev/null 2>&1 || true
    
    aws apigateway put-integration \
      --rest-api-id ${API_ID} \
      --resource-id ${RESOURCE_ID} \
      --http-method OPTIONS \
      --type MOCK \
      --region ${AWS_REGION} > /dev/null 2>&1 || true
}

# Create all resources using the function
create_resource_with_methods "/allergens" ${ROOT_ID}
create_resource_with_methods "/antibody-trends" ${ROOT_ID}
create_resource_with_methods "/autoimmune-markers" ${ROOT_ID}
create_resource_with_methods "/vaccinations" ${ROOT_ID}
create_resource_with_methods "/immunity-passports" ${ROOT_ID}

echo -e "${GREEN}✓ API Resources created${NC}"

# Step 7: Add Lambda Permission
echo -e "\n${YELLOW}Step 6: Adding Lambda Permission...${NC}"

aws lambda add-permission \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${AWS_REGION}:${AWS_ACCOUNT_ID}:${API_ID}/*/*" \
  --region ${AWS_REGION} 2>/dev/null || echo "Permission already exists"

echo -e "${GREEN}✓ Lambda permission added${NC}"

# Step 8: Deploy API
echo -e "\n${YELLOW}Step 7: Deploying API...${NC}"

aws apigateway create-deployment \
  --rest-api-id ${API_ID} \
  --stage-name prod \
  --region ${AWS_REGION} > /dev/null

API_ENDPOINT="https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod"

echo -e "${GREEN}✓ API deployed${NC}"

# Step 9: Output Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Configuration Summary:${NC}"
echo "API Gateway URL: ${API_ENDPOINT}"
echo "Lambda Function: ${LAMBDA_FUNCTION_NAME}"
echo "API ID: ${API_ID}"
echo "AWS Region: ${AWS_REGION}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update your .env file with:"
echo "   REACT_APP_API_URL=${API_ENDPOINT}"
echo ""
echo "2. Deploy frontend:"
echo "   npm run build"
echo "   aws s3 sync build/ s3://your-bucket-name"
echo ""
echo "3. Test the API:"
echo "   curl -X GET ${API_ENDPOINT}/allergens \\"
echo "     -H \"Authorization: Bearer YOUR_ID_TOKEN\""
echo ""

# Save configuration for future reference
cat > deployment-config.json << EOF
{
  "api_endpoint": "${API_ENDPOINT}",
  "api_id": "${API_ID}",
  "lambda_function": "${LAMBDA_FUNCTION_NAME}",
  "lambda_arn": "${LAMBDA_ARN}",
  "aws_region": "${AWS_REGION}",
  "aws_account_id": "${AWS_ACCOUNT_ID}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}✓ Configuration saved to deployment-config.json${NC}"
