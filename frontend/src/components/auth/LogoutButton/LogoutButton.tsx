import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut } from 'lucide-react';
import type { LogoutButtonProps } from './LogoutButton.types';

const sizeMap = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  size = 'md',
  variant = 'ghost',
}) => {
  const { logout } = useAuth0();

  return (
    <button
      className={['btn', `btn-${variant}`, sizeMap[size]]
        .filter(Boolean)
        .join(' ')}
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      aria-label="Sign out"
    >
      <LogOut size={16} aria-hidden="true" />
      Sign Out
    </button>
  );
};
