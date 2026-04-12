/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setTokenGetter } from '@/utils/api';
import { syncUser } from '@/utils/authApi';
import { useDemo } from '@/context/DemoContext';
import { getAuthProfileDisplayName } from '@/utils/formatters';
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

const buildFallbackAppUser = (
  authUser: ReturnType<typeof useAuth0>['user']
): User => {
  const displayName = getAuthProfileDisplayName(authUser);
  const fallbackEmail =
    authUser?.email?.trim() || `${displayName.replace(/\s+/g, '.')}@auth.local`;
  const timestamp = new Date().toISOString();

  return {
    _id: authUser?.sub || `auth0-${fallbackEmail}`,
    auth0Id: authUser?.sub || fallbackEmail,
    email: fallbackEmail,
    name: displayName,
    avatar: authUser?.picture,
    role: 'user',
    organizationId: undefined,
    organizationRole: undefined,
    organization: null,
    settings: {
      defaultLogo: undefined,
      defaultColors: {
        primary: '#3B82F6',
        secondary: '#64748B',
      },
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading } =
    useAuth0();
  const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
  const { isDemoMode, mockUser } = useDemo();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // In demo mode, use mock user directly — skip all API calls
  useEffect(() => {
    if (isDemoMode) {
      setAppUser(mockUser);
      setIsLoadingUser(false);
      setTokenGetter(async () => 'mock-demo-token');
    }
  }, [isDemoMode, mockUser]);

  useEffect(() => {
    if (isDemoMode) return;
    if (!isLoading && isAuthenticated) {
      setTokenGetter(() =>
        getAccessTokenSilently(
          auth0Audience
            ? { authorizationParams: { audience: auth0Audience } }
            : undefined
        )
      );
    } else if (!isLoading && !isAuthenticated) {
      setTokenGetter(null);
    }
  }, [
    isDemoMode,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    auth0Audience,
  ]);

  useEffect(() => {
    if (isDemoMode) return;
    const syncUserData = async () => {
      if (!isLoading && isAuthenticated && user) {
        setIsLoadingUser(true);
        const fallbackUser = buildFallbackAppUser(user);
        setAppUser((currentUser) => currentUser || fallbackUser);
        try {
          const result = await syncUser({
            email: user.email?.trim() || fallbackUser.email,
            name: getAuthProfileDisplayName(user),
            avatar: user.picture,
          });
          setAppUser(result.data || fallbackUser);
        } catch (err) {
          console.error('Failed to sync user:', err);
          setAppUser(fallbackUser);
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
