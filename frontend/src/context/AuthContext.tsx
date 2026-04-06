/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setTokenGetter } from '@/utils/api';
import { syncUser } from '@/utils/authApi';
import { useDemo } from '@/context/DemoContext';
import type { User } from '@/types';

interface AuthContextValue {
  appUser: User | null;
  isLoadingUser: boolean;
  setAppUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue>({
  appUser: null,
  isLoadingUser: true,
  setAppUser: () => undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
  const { isDemoMode, mockUser } = useDemo();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // In demo mode, use mock user directly — skip all API calls
  useEffect(() => {
    if (isDemoMode) {
      setAppUser(mockUser);
      setIsLoadingUser(false);
    }
  }, [isDemoMode, mockUser]);

  useEffect(() => {
    if (isDemoMode) return;
    if (!isLoading && isAuthenticated) {
      setTokenGetter(getAccessTokenSilently);
    } else if (!isLoading && !isAuthenticated) {
      setTokenGetter(null);
    }
  }, [isDemoMode, isAuthenticated, isLoading, getAccessTokenSilently]);

  useEffect(() => {
    if (isDemoMode) return;
    const syncUserData = async () => {
      if (!isLoading && isAuthenticated && user) {
        setIsLoadingUser(true);
        try {
          const result = await syncUser({
            email: user.email || '',
            name: user.name || '',
            avatar: user.picture,
          });
          setAppUser(result.data || null);
        } catch (err) {
          console.error('Failed to sync user:', err);
        } finally {
          setIsLoadingUser(false);
        }
      } else if (!isLoading && !isAuthenticated) {
        setAppUser(null);
        setIsLoadingUser(false);
      }
    };
    syncUserData();
  }, [isDemoMode, isAuthenticated, isLoading, user]);

  return (
    <AuthContext.Provider value={{ appUser, isLoadingUser, setAppUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppUser = () => useContext(AuthContext);
