import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface UserInfo {
  email: string;
  name: string;
  sub: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, birthdate: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app start
    (async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        if (authenticated) {
          const storedUser = await authService.getUser();
          setUser(storedUser);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const userInfo = await authService.login(email, password);
    setUser(userInfo);
  };

  const signup = async (email: string, password: string, name: string, birthdate: string) => {
    await authService.signup(email, password, name, birthdate);
  };

  const confirmSignUp = async (email: string, code: string) => {
    await authService.confirmSignUp(email, code);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        confirmSignUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
