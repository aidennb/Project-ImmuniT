// ImmuniT API & Auth Configuration
// Connects to the deployed AWS backend

export const CONFIG = {
  // API Gateway endpoint
  API_BASE_URL: 'https://ri2ubpde14.execute-api.us-west-2.amazonaws.com/prod',

  // Cognito configuration
  COGNITO_REGION: 'us-west-2',
  COGNITO_USER_POOL_ID: 'us-west-2_Tg7giNyV6',
  COGNITO_CLIENT_ID: '3bbrorsbrhi30b98nstb64mqeg',
} as const;
