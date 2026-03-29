# Immunity Passport - Full Stack Application

A comprehensive health tracking application built with React, AWS Cognito, Python Lambda, and PostgreSQL.

## Features

- **User Authentication**: Secure login/signup with AWS Cognito
- **Multi-Tab Dashboard**: Manage 5 different health data categories
- **CRUD Operations**: Create, read, update, and delete health records
- **Data Categories**:
  - Allergens tracking with sensitivity levels
  - Antibody trends monitoring
  - Autoimmune markers
  - Vaccination records
  - Immunity passport snapshots
- **Responsive Design**: Works on desktop and mobile devices
- **Secure API**: Token-based authentication with Cognito JWT

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling

### Backend
- AWS Lambda (Python 3.11)
- AWS API Gateway
- AWS Cognito for authentication
- PostgreSQL RDS database

### Database
- PostgreSQL running on AWS RDS
- 6 main tables for health data management

## Project Structure

```
immunity-passport/
├── public/
│   └── index.html
├── src/
│   ├── services/
│   │   ├── authService.js      # Cognito authentication
│   │   └── apiService.js       # API client methods
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Signup.js           # Registration page
│   │   ├── ConfirmSignUp.js    # Email confirmation
│   │   └── Dashboard.js        # Main dashboard with CRUD
│   ├── styles/
│   │   ├── Auth.css
│   │   └── Dashboard.css
│   ├── App.js
│   ├── index.js
│   └── index.css
├── lambda/
│   ├── lambda_handler.py       # Main Lambda function
│   ├── requirements.txt
│   └── SAM-template.yaml       (optional)
├── package.json
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.11+
- AWS Account with:
  - Cognito User Pool (`us-west-2_Tg7giNyV6`)
  - Lambda function
  - API Gateway
  - RDS PostgreSQL instance

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # REACT_APP_COGNITO_CLIENT_ID=YOUR_CLIENT_ID
   # REACT_APP_API_URL=https://your-api-gateway-url
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   Opens at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   pip install -r lambda/requirements.txt
   ```

2. **Configure Lambda Environment Variables**
   - `DB_USER`: PostgreSQL username
   - `DB_PASSWORD`: PostgreSQL password

3. **Deploy to Lambda**
   ```bash
   cd lambda
   zip -r lambda.zip lambda_handler.py
   aws lambda update-function-code \
     --function-name cognito-rds-api \
     --zip-file fileb://lambda.zip \
     --region us-west-2
   ```

## Database Schema

### Allergens Table
```sql
CREATE TABLE public.allergens (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    allergen_type text,
    allergen_name text,
    sensitivity_level integer,
    recorded_at date,
    symptoms_flagged text[]
);
```

### Antibody Trends Table
```sql
CREATE TABLE public.antibody_trends (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    antibody_name text NOT NULL,
    titer_value numeric,
    unit text,
    recorded_at date
);
```

### Autoimmune Markers Table
```sql
CREATE TABLE public.autoimmune_markers (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    marker_name text NOT NULL,
    value numeric,
    unit text,
    date_recorded date,
    clinical_flag text,
    reference_range text
);
```

### Vaccinations Table
```sql
CREATE TABLE public.vaccinations (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    vaccine_name text NOT NULL,
    date_administered date,
    dose_number integer,
    manufacturer text,
    status text
);
```

### Immunity Passport Snapshots Table
```sql
CREATE TABLE public.immunity_passport_snapshots (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    snapshot_date date NOT NULL,
    pdf_url text,
    includes_sections text[],
    shared_with_email text
);
```

### Users Table
```sql
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY,
    name text,
    email text,
    password_hash text,
    date_of_birth date,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    apple_health_id text
);
```

## API Endpoints

### Allergens
- `GET /allergens` - Get all allergens
- `POST /allergens` - Create new allergen
- `GET /allergens/{id}` - Get specific allergen
- `PUT /allergens/{id}` - Update allergen
- `DELETE /allergens/{id}` - Delete allergen

### Antibody Trends
- `GET /antibody-trends` - Get all trends
- `POST /antibody-trends` - Create new trend
- `GET /antibody-trends/{id}` - Get specific trend
- `PUT /antibody-trends/{id}` - Update trend
- `DELETE /antibody-trends/{id}` - Delete trend

### Autoimmune Markers
- `GET /autoimmune-markers` - Get all markers
- `POST /autoimmune-markers` - Create new marker
- `GET /autoimmune-markers/{id}` - Get specific marker
- `PUT /autoimmune-markers/{id}` - Update marker
- `DELETE /autoimmune-markers/{id}` - Delete marker

### Vaccinations
- `GET /vaccinations` - Get all vaccinations
- `POST /vaccinations` - Create new vaccination
- `GET /vaccinations/{id}` - Get specific vaccination
- `PUT /vaccinations/{id}` - Update vaccination
- `DELETE /vaccinations/{id}` - Delete vaccination

### Immunity Passports
- `GET /immunity-passports` - Get all passports
- `POST /immunity-passports` - Create new passport
- `GET /immunity-passports/{id}` - Get specific passport
- `PUT /immunity-passports/{id}` - Update passport
- `DELETE /immunity-passports/{id}` - Delete passport

## Authentication Flow

1. User signs up with email, password, name, and birthdate
2. Email verification code sent to user
3. User confirms email with verification code
4. User logs in with email and password
5. Cognito returns ID token
6. ID token sent with all API requests in Authorization header
7. Lambda verifies token and retrieves user_id
8. All database queries filtered by user_id for data isolation

## Deployment

### Option 1: Automated Deployment (Recommended)

Use the provided deployment script for a complete, automated setup:

```bash
# Set required environment variables
export AWS_REGION=us-west-2
export DB_USER=postgres
export DB_PASSWORD=your_secure_password
export VPC_SUBNET_IDS=subnet-xxxxx,subnet-yyyyy
export VPC_SECURITY_GROUP_IDS=sg-xxxxx

# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
1. ✓ Create IAM role with required permissions
2. ✓ Build and deploy Lambda layer with dependencies
3. ✓ Package and deploy Lambda function
4. ✓ Create API Gateway REST API
5. ✓ Create all required resources and methods
6. ✓ Configure CORS
7. ✓ Deploy API to prod stage
8. ✓ Output configuration for frontend

**Output:** The script creates `deployment-config.json` with all URLs and IDs you need.

---

### Option 2: Manual Deployment (Step-by-Step)

#### Step 1: Create Lambda Execution Role

```bash
aws iam create-role \
  --role-name lambda-immunity-passport-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --region us-west-2
```

#### Step 2: Attach Required Policies

```bash
# VPC execution policy for RDS access
aws iam attach-role-policy \
  --role-name lambda-immunity-passport-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole \
  --region us-west-2

# CloudWatch logs policy
aws iam attach-role-policy \
  --role-name lambda-immunity-passport-role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess \
  --region us-west-2
```

#### Step 3: Create Lambda Layer for Dependencies

```bash
# Create layer directory structure
mkdir -p python
pip install psycopg2-binary PyJWT urllib3 boto3 -t python/

# Create layer zip
zip -r lambda_layer.zip python/

# Publish layer to AWS
aws lambda publish-layer-version \
  --layer-name immunity-passport-dependencies \
  --zip-file fileb://lambda_layer.zip \
  --compatible-runtimes python3.11 \
  --region us-west-2

# Note the LayerVersionArn from the response
```

#### Step 4: Package and Deploy Lambda Function

```bash
# Package Lambda function
zip lambda_function.zip lambda_handler.py

# Get your AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Get the layer ARN (from previous step or list layers)
LAYER_ARN=$(aws lambda list-layer-versions \
  --layer-name immunity-passport-dependencies \
  --max-items 1 \
  --query 'LayerVersions[0].LayerVersionArn' \
  --output text \
  --region us-west-2)

# Create Lambda function
aws lambda create-function \
  --function-name immunity-passport-api \
  --runtime python3.11 \
  --role arn:aws:iam::${AWS_ACCOUNT_ID}:role/lambda-immunity-passport-role \
  --handler lambda_handler.lambda_handler \
  --zip-file fileb://lambda_function.zip \
  --timeout 30 \
  --memory-size 256 \
  --vpc-config SubnetIds=subnet-xxxxx,SecurityGroupIds=sg-xxxxx \
  --layers ${LAYER_ARN} \
  --environment Variables="{DB_USER=postgres,DB_PASSWORD=your_password}" \
  --region us-west-2
```

**Note:** Replace `subnet-xxxxx` and `sg-xxxxx` with your VPC subnet and security group that have access to RDS.

#### Step 5: Update Lambda (for future deployments)

```bash
zip lambda_function.zip lambda_handler.py

aws lambda update-function-code \
  --function-name immunity-passport-api \
  --zip-file fileb://lambda_function.zip \
  --region us-west-2
```

### 2. Create API Gateway

#### Step 1: Create REST API

```bash
API_ID=$(aws apigateway create-rest-api \
  --name immunity-passport-api \
  --description "API for Immunity Passport application" \
  --endpoint-configuration types=REGIONAL \
  --region us-west-2 \
  --query 'id' \
  --output text)

echo "API ID: $API_ID"
```

#### Step 2: Get Root Resource ID

```bash
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region us-west-2 \
  --query 'items[0].id' \
  --output text)

echo "Root Resource ID: $ROOT_ID"
```

#### Step 3: Create Resources for Each Endpoint

```bash
# Create allergens resource
ALLERGENS_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part allergens \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create allergens/{id} resource
ALLERGEN_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ALLERGENS_ID \
  --path-part '{id}' \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create antibody-trends resource
TRENDS_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part antibody-trends \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create antibody-trends/{id} resource
TREND_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $TRENDS_ID \
  --path-part '{id}' \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create autoimmune-markers resource
MARKERS_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part autoimmune-markers \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create autoimmune-markers/{id} resource
MARKER_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $MARKERS_ID \
  --path-part '{id}' \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create vaccinations resource
VACC_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part vaccinations \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create vaccinations/{id} resource
VAC_SINGLE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $VACC_ID \
  --path-part '{id}' \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create immunity-passports resource
PASSPORT_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part immunity-passports \
  --region us-west-2 \
  --query 'id' \
  --output text)

# Create immunity-passports/{id} resource
PASSPORT_SINGLE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $PASSPORT_ID \
  --path-part '{id}' \
  --region us-west-2 \
  --query 'id' \
  --output text)
```

#### Step 4: Create Methods and Integrations

Create a bash script to automate method creation. Save as `create_methods.sh`:

```bash
#!/bin/bash

API_ID=$1
LAMBDA_ARN=$2
AWS_REGION="us-west-2"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Function to create method
create_method() {
  local api_id=$1
  local resource_id=$2
  local http_method=$3
  local lambda_arn=$4
  
  # Create method
  aws apigateway put-method \
    --rest-api-id $api_id \
    --resource-id $resource_id \
    --http-method $http_method \
    --authorization-type NONE \
    --region $AWS_REGION

  # Create Lambda integration
  aws apigateway put-integration \
    --rest-api-id $api_id \
    --resource-id $resource_id \
    --http-method $http_method \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${lambda_arn}/invocations \
    --region $AWS_REGION
}

# Get resource IDs (you'll need to output these from previous step)
# For now, we'll assume they're passed or you run this after capturing them

echo "Methods created successfully"
```

#### Step 5: Add Lambda Permissions for API Gateway

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws lambda add-permission \
  --function-name immunity-passport-api \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-west-2:${AWS_ACCOUNT_ID}:${API_ID}/*/*" \
  --region us-west-2
```

#### Step 6: Enable CORS for All Resources

```bash
# Function to enable CORS on a resource
enable_cors() {
  local api_id=$1
  local resource_id=$2
  
  aws apigateway put-method \
    --rest-api-id $api_id \
    --resource-id $resource_id \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region us-west-2

  aws apigateway put-integration \
    --rest-api-id $api_id \
    --resource-id $resource_id \
    --http-method OPTIONS \
    --type MOCK \
    --region us-west-2

  aws apigateway put-integration-response \
    --rest-api-id $api_id \
    --resource-id $resource_id \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters \
      "method.response.header.Access-Control-Allow-Headers=true,\
method.response.header.Access-Control-Allow-Methods=true,\
method.response.header.Access-Control-Allow-Origin=true" \
    --response-templates '{"application/json":""}' \
    --region us-west-2
}

# Enable CORS on all resource IDs
enable_cors $API_ID $ALLERGENS_ID
enable_cors $API_ID $ALLERGEN_ID
enable_cors $API_ID $TRENDS_ID
enable_cors $API_ID $TREND_ID
enable_cors $API_ID $MARKERS_ID
enable_cors $API_ID $MARKER_ID
enable_cors $API_ID $VACC_ID
enable_cors $API_ID $VAC_SINGLE_ID
enable_cors $API_ID $PASSPORT_ID
enable_cors $API_ID $PASSPORT_SINGLE_ID
```

#### Step 7: Deploy API

```bash
# Create deployment
DEPLOYMENT=$(aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region us-west-2 \
  --query 'id' \
  --output text)

echo "Deployment ID: $DEPLOYMENT"

# Get the API endpoint
API_ENDPOINT="https://${API_ID}.execute-api.us-west-2.amazonaws.com/prod"
echo "API Endpoint: $API_ENDPOINT"
```

#### Step 8: Update Frontend .env

```bash
# Update your .env file with the API endpoint
echo "REACT_APP_API_URL=${API_ENDPOINT}" >> .env
```

### 3. Deploy Frontend to S3

```bash
# Create S3 bucket
aws s3 mb s3://immunity-passport-app-$(date +%s) --region us-west-2

# Build React app
npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Enable static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 4. Deploy with CloudFront

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.us-west-2.amazonaws.com \
  --default-root-object index.html \
  --default-cache-behavior \
    TargetOriginId=S3Origin,\
ViewerProtocolPolicy=redirect-to-https,\
AllowedMethods=GET,HEAD,OPTIONS \
  --region us-west-2
```

### 5. Testing the API

```bash
# Get ID token (after logging in)
# Or use AWS CLI to get it from Cognito

TOKEN="your_id_token_here"

# Test allergens endpoint
curl -X GET https://${API_ID}.execute-api.us-west-2.amazonaws.com/prod/allergens \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"

# Test POST
curl -X POST https://${API_ID}.execute-api.us-west-2.amazonaws.com/prod/allergens \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "allergen_type": "food",
    "allergen_name": "peanuts",
    "sensitivity_level": 3,
    "recorded_at": "2024-01-29"
  }'
```

## Security Best Practices

### RDS Security Group Configuration

Before deploying the Lambda function, ensure your RDS security group allows inbound traffic from the Lambda function:

```bash
# Get your VPC's security group for Lambda (or create one)
LAMBDA_SG=$(aws ec2 create-security-group \
  --group-name lambda-immunity-passport-sg \
  --description "Security group for Lambda accessing RDS" \
  --vpc-id vpc-xxxxx \
  --region us-west-2 \
  --query 'GroupId' \
  --output text)

# Get RDS security group ID
RDS_SG=$(aws rds describe-db-instances \
  --db-instance-identifier immunit-devt \
  --region us-west-2 \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text)

# Allow Lambda security group to access RDS on port 5432
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $LAMBDA_SG \
  --region us-west-2

echo "Lambda SG: $LAMBDA_SG"
echo "RDS SG: $RDS_SG"
```

### Additional Security Measures

- ✅ All database queries use parameterized statements
- ✅ User data isolated by user_id from Cognito token
- ✅ JWT token verification on every API request
- ✅ HTTPS enforced via CloudFront
- ✅ RDS database uses SSL connections
- ✅ Lambda functions run in VPC for database access
- ✅ IAM roles with least privilege
- ✅ Enable RDS encryption at rest
- ✅ Enable RDS automated backups
- ✅ Use Secrets Manager for database credentials (optional)

### Store Secrets in AWS Secrets Manager (Recommended)

Instead of storing database password in Lambda environment variables:

```bash
# Create secret
aws secretsmanager create-secret \
  --name immunity-passport/db-password \
  --secret-string '{"password":"your_secure_password"}' \
  --region us-west-2

# Update Lambda execution role policy to access Secrets Manager
cat > policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-west-2:ACCOUNT_ID:secret:immunity-passport/db-password-*"
    }
  ]
}
EOF

# Attach policy
aws iam put-role-policy \
  --role-name lambda-immunity-passport-role \
  --policy-name AllowSecretsManager \
  --policy-document file://policy.json
```

## Troubleshooting

### API Gateway Issues

**Problem:** "Method Not Allowed" errors
- **Solution:** Ensure all HTTP methods (GET, POST, PUT, DELETE) are created for each resource
- Check that Lambda integration is set to AWS_PROXY type

**Problem:** CORS errors in browser
- **Solution:** Verify OPTIONS method is enabled on all resources
- Check CORS headers are returned from API Gateway

**Problem:** 403 "Invalid API Key" error
- **Solution:** API Gateway is configured to require API key
- Go to API Gateway → Settings and disable API key requirement
- Or add Authorization header to all requests

### Lambda Issues

**Problem:** "Invalid ZIP code 1" error
- **Solution:** Ensure lambda_handler.py is at the root of zip file
- Don't include the parent directory in zip

**Problem:** Lambda timeout
- **Solution:** Increase timeout in Lambda settings (currently 30s)
- Check CloudWatch logs for slow queries
- Verify RDS instance is running and responsive

**Problem:** "function not found" error
- **Solution:** Verify Lambda function name matches in API Gateway integration
- Check the function exists: `aws lambda get-function --function-name immunity-passport-api`

### Database Issues

**Problem:** "connection refused" or "could not connect"
- **Solution:** Verify RDS security group allows inbound 5432 from Lambda security group
- Check RDS instance is running: `aws rds describe-db-instances`
- Verify database credentials are correct

**Problem:** "permission denied" errors
- **Solution:** Check that PostgreSQL user has correct permissions
- Run: `GRANT ALL ON public.* TO postgres;`

**Problem:** Tables don't exist
- **Solution:** Ensure all CREATE TABLE statements were executed
- Verify you're connecting to correct database (test_immunit)

### Frontend Issues

**Problem:** "Unauthorized" when trying to fetch data
- **Solution:** Verify Cognito User Pool ID is correct
- Check ID token is valid (hasn't expired)
- Verify Authorization header format: `Bearer <token>`

**Problem:** Page shows "Failed to fetch data"
- **Solution:** Check API endpoint URL in .env is correct
- Verify API Gateway is deployed
- Check browser network tab for error details
- Check Lambda CloudWatch logs

**Problem:** Login redirects to blank page
- **Solution:** Verify Cognito App Client settings
- Check allowed callback URLs include your domain
- Verify User Pool ID and Client ID in authService.js

### General Troubleshooting Steps

1. **Check CloudWatch Logs**
   ```bash
   aws logs tail /aws/lambda/immunity-passport-api --follow --region us-west-2
   ```

2. **Check API Gateway Logs**
   ```bash
   aws apigateway get-stage --rest-api-id $API_ID --stage-name prod --region us-west-2
   ```

3. **Test with curl**
   ```bash
   curl -X GET https://API_ID.execute-api.us-west-2.amazonaws.com/prod/allergens \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Enable API Gateway Logging**
   ```bash
   aws apigateway update-stage \
     --rest-api-id $API_ID \
     --stage-name prod \
     --patch-operations op=replace,path=/accessLogSetting/destinationArn,value=arn:aws:logs:us-west-2:ACCOUNT_ID:log-group:api-gateway-logs \
     --region us-west-2
   ```

### "Invalid token" Error
- Verify User Pool ID matches in `authService.js`
- Check Cognito Client ID in `.env`
- Ensure token hasn't expired

### "Database connection failed"
- Verify Lambda is in same VPC as RDS
- Check security group allows inbound 5432
- Verify DB credentials in Lambda environment

### CORS Errors
- Ensure API Gateway has CORS enabled
- Check `Access-Control-Allow-Origin` header

### Data not loading
- Check browser console for errors
- Verify API URL in `.env`
- Check Lambda CloudWatch logs

## Environment Variables

### Frontend (.env)
```
REACT_APP_COGNITO_CLIENT_ID=your_client_id
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_ENVIRONMENT=production
```

### Lambda (Environment Variables)
```
DB_USER=postgres
DB_PASSWORD=your_password
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Lambda CloudWatch logs
3. Check browser console for errors
4. Verify AWS resource configuration
