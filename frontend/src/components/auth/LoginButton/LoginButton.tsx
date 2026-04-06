import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { LoginButtonProps } from './LoginButton.types';

const sizeMap = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

export const LoginButton: React.FC<LoginButtonProps> = ({
  size = 'md',
  variant = 'primary',
  label = 'Get Started Free',
}) => {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <button
      className={[
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-outline',
        sizeMap[size],
        isLoading ? 'loading loading-spinner' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
    >
      {!isLoading && label}
    </button>
  );
};
