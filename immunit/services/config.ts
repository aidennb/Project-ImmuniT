// ImmuniT API & Auth Configuration
// Connects to Jon's deployed DynamoDB backend (immunit-infra)

export const CONFIG = {
  // API Gateway endpoint (Data Sandbox - immunit-dev stack)
  API_BASE_URL: 'https://q1x9ernlsk.execute-api.us-west-2.amazonaws.com/dev',

  // API Key for API Gateway authentication
  API_KEY: 'f5D1v4LzdU6dJIYhnOIZjaRlJ3rczEza6crRq0aS',

  // Cognito configuration (Sandbox Account)
  COGNITO_REGION: 'us-west-2',
  COGNITO_USER_POOL_ID: 'us-west-2_Tg7giNyV6',
  COGNITO_CLIENT_ID: '3bbrorsbrhi30b98nstb64mqeg',
} as const;
