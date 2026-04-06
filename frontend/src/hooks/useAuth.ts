import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const handleLogout = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const getToken = useCallback(async () => {
    return getAccessTokenSilently();
  }, [getAccessTokenSilently]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout: handleLogout,
    getToken,
  };
};
