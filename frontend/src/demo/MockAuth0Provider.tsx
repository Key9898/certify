import React from 'react';
import { Auth0Context } from '@auth0/auth0-react';
import type { Auth0ContextInterface, User } from '@auth0/auth0-react';

const MOCK_AUTH0_USER: User = {
  sub: 'demo|123456',
  name: 'Demo User',
  email: 'demo@example.com',
  picture: undefined,
  email_verified: true,
};

const mockContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: MOCK_AUTH0_USER,
  error: undefined,
  getAccessTokenSilently: async () => 'mock-demo-token',
  getAccessTokenWithPopup: async () => undefined,
  getIdTokenClaims: async () => undefined,
  loginWithRedirect: async () => {},
  loginWithPopup: async () => {},
  logout: async () => {},
  handleRedirectCallback: async () => ({ appState: undefined }),
} as unknown as Auth0ContextInterface;

export const MockAuth0Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Auth0Context.Provider value={mockContextValue}>
      {children}
    </Auth0Context.Provider>
  );
};
