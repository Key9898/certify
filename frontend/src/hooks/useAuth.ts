import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export const useAuth = () => {
  const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';

  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = useCallback(() => {
    void loginWithRedirect({
      appState: { returnTo: window.location.pathname || '/' },
    });
  }, [loginWithRedirect]);

  const handleLogout = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const getToken = useCallback(
    () =>
      getAccessTokenSilently(
        auth0Audience
          ? { authorizationParams: { audience: auth0Audience } }
          : undefined
      ),
    [getAccessTokenSilently, auth0Audience]
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout: handleLogout,
    getToken,
  };
};
