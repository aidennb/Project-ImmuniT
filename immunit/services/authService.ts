// ImmuniT Auth Service
// Handles Cognito authentication for mobile app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from './config';

const TOKEN_KEY = 'immunit_id_token';
const USER_KEY = 'immunit_user';

interface AuthTokens {
  IdToken: string;
  AccessToken: string;
  RefreshToken: string;
}

interface CognitoAuthResult {
  AuthenticationResult: AuthTokens;
}

interface UserInfo {
  email: string;
  name: string;
  sub: string;
}

// Use Cognito USER_SRP_AUTH via the public API (no SDK dependency)
async function cognitoRequest(action: string, payload: Record<string, any>) {
  const response = await fetch(
    `https://cognito-idp.${CONFIG.COGNITO_REGION}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.message || data.__type || 'Authentication failed';
    throw new Error(errorMessage);
  }
  return data;
}

export const authService = {
  /**
   * Sign in with email and password.
   * Uses InitiateAuth with USER_PASSWORD_AUTH flow.
   */
  login: async (email: string, password: string): Promise<UserInfo> => {
    const result: CognitoAuthResult = await cognitoRequest('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CONFIG.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const idToken = result.AuthenticationResult.IdToken;
    await AsyncStorage.setItem(TOKEN_KEY, idToken);

    // Decode the JWT payload to extract user info
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const user: UserInfo = {
      email: payload.email || email,
      name: payload.name || payload.email || email,
      sub: payload.sub,
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Sign up a new user.
   */
  signup: async (
    email: string,
    password: string,
    name: string,
    birthdate: string,
  ): Promise<void> => {
    await cognitoRequest('SignUp', {
      ClientId: CONFIG.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'birthdate', Value: birthdate },
      ],
    });
  },

  /**
   * Confirm sign-up with verification code.
   */
  confirmSignUp: async (email: string, code: string): Promise<void> => {
    await cognitoRequest('ConfirmSignUp', {
      ClientId: CONFIG.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });
  },

  /**
   * Sign out the current user.
   */
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  /**
   * Get the stored ID token (or null if not logged in).
   */
  getIdToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the stored user info.
   */
  getUser: async (): Promise<UserInfo | null> => {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  /**
   * Check if the user is authenticated.
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
