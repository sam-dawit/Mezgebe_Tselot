import React, { createContext, useContext, useEffect, useState } from 'react';
import { Models } from 'react-native-appwrite';
import { account } from '../utils/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      // If user is anonymous (guest), clear session so they have to register/login
      if (!session.email) {
        await account.deleteSession('current');
        setUser(null);
      } else {
        setUser(session);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    await checkUser();
  };

  const signInAsGuest = async () => {
    try {
      await account.createAnonymousSession();
      await checkUser();
    } catch (e) {
      console.error('Guest sign in failed', e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInAsGuest, signOut, checkUser }}>
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
