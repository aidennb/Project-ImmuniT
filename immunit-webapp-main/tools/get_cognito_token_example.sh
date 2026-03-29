AWS_REGION=us-west-2
DEV_COGNITO_USER_ID=3bbrorsbrhi30b98nstb64mqeg
COGNITO_USER_ID=$DEV_COGNITO_USER_ID

aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $COGNITO_USER_ID \
  --auth-parameters "USERNAME=$username, PASSWORD=$password" \
  --region $AWS_REGION

   
