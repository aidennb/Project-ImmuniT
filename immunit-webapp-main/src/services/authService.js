import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-west-2_Tg7giNyV6',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '3bbrorsbrhi30b98nstb64mqeg',
};

const userPool = new CognitoUserPool(poolData);

export const authService = {
  signup: async (email, password, name, birthdate) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'birthdate', Value: birthdate }
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  confirmSignUp: async (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const idToken = result.getIdToken().getJwtToken();
          localStorage.setItem('idToken', idToken);
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  logout: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      localStorage.removeItem('idToken');
    }
  },

  getCurrentUser: () => {
    return userPool.getCurrentUser();
  },

  getIdToken: async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return null;

    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session.getIdToken().getJwtToken());
        }
      });
    });
  }
};
