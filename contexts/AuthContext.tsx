import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, User } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        if (token === 'guest-token') {
          setUser({ _id: 'guest', username: 'Guest', email: '' });
        } else {
          const userData = await api.getMe();
          if (userData) {
            setUser(userData);
          } else {
            // Token invalid or expired
            await signOut();
          }
        }
      }
    } catch (e) {
      console.error('Auth check failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      const userData = await api.getMe();
      setUser(userData);
    } catch (e) {
      console.error('Sign in failed', e);
      throw e;
    }
  };

  const signInAsGuest = async () => {
    try {
      // Do not persist guest token so next time user opens app, they must login again
      // await SecureStore.setItemAsync('userToken', 'guest-token');
      setUser({ _id: 'guest', username: 'Guest', email: '' });
    } catch (e) {
      console.error('Guest sign in failed', e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
