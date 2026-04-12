import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
  User,
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppUser } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import {
  getAuthProfileDisplayName,
  getAuthProfileInitial,
} from '@/utils/formatters';

const getRoleInfo = (role: string | undefined) => {
  switch (role) {
    case 'owner':
      return {
        label: 'Owner',
        icon: Crown,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      };
    case 'admin':
      return {
        label: 'Admin',
        icon: Shield,
        color: 'text-primary',
        bg: 'bg-primary/10',
      };
    default:
      return {
        label: 'Member',
        icon: User,
        color: 'text-base-content/50',
        bg: 'bg-base-200',
      };
  }
};

export const AvatarDropdown: React.FC = () => {
  const { user, logout } = useAuth0();
  const { appUser } = useAppUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = getAuthProfileDisplayName(user);
  const roleInfo = getRoleInfo(appUser?.organizationRole);
  const RoleIcon = roleInfo.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-base-200/60 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="avatar p-0.5 ring-2 ring-primary/20 ring-offset-1 rounded">
          <div className="w-8 rounded">
            {user?.picture ? (
              <img src={user.picture} alt={displayName || 'User avatar'} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-content">
                {getAuthProfileInitial(user)}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-base-content/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl border border-base-200 bg-base-100 p-2 shadow-xl shadow-base-300/20"
          >
            <div className="px-3 py-3 mb-1">
              <div className="flex items-center gap-3">
                <div className="avatar p-0.5 ring-2 ring-primary/20 rounded">
                  <div className="w-10 rounded">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={displayName || 'User avatar'}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-primary-content">
                        {getAuthProfileInitial(user)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-base-content truncate">
                    {displayName}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 mt-0.5 ${roleInfo.bg} ${roleInfo.color} px-2 py-0.5 rounded-full`}
                  >
                    <RoleIcon size={10} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-base-200 my-1" />

            <Link
              to={ROUTES.SETTINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/70 hover:bg-base-200/60 hover:text-base-content transition-colors"
            >
              <Settings size={16} />
              Profile & Settings
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error/80 hover:bg-error/10 hover:text-error transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
