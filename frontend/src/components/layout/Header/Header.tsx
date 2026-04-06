import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, Award } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { ROUTES } from '@/utils/constants';
import type { HeaderProps } from './Header.types';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SOFT_SPRING}
      className="navbar sticky top-0 z-30 border-b border-base-200 bg-base-100/80 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="navbar-start">
          {isAuthenticated && (
            <motion.button
              className="btn btn-ghost btn-sm mr-2 rounded lg:hidden"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
              whileHover={{ y: -2, transition: QUICK_SPRING }}
              whileTap={TAP_PRESS}
            >
              <Menu size={22} className="text-base-content/70" />
            </motion.button>
          )}

          <motion.div whileHover={{ y: -2, transition: SOFT_SPRING }}>
            <Link to={ROUTES.HOME} className="group flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -6, scale: 1.06, transition: QUICK_SPRING }}
                className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
              >
                <Award size={20} className="text-primary-content" />
              </motion.div>
              <span className="text-2xl font-black tracking-tighter text-base-content">Certify</span>
            </Link>
          </motion.div>
        </div>

        <div className="navbar-end gap-3">
          {isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <motion.div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar p-0.5 ring-1 ring-primary/20 ring-offset-1 hover:ring-primary"
                whileHover={{ y: -2, scale: 1.03 }}
                transition={SOFT_SPRING}
              >
                <div className="w-10 overflow-hidden rounded-full">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-base font-bold text-primary-content">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </motion.div>
              <ul
                tabIndex={0}
                className="menu menu-md dropdown-content z-[100] mt-4 w-64 rounded border border-base-200 bg-base-100 p-2 shadow-2xl"
              >
                <li className="mb-2 border-b border-base-100 px-4 py-3">
                  <div className="flex flex-col items-start gap-1 p-0">
                    <span className="leading-none font-black text-base-content">{user.name}</span>
                    <span className="w-full truncate text-xs font-medium text-base-content/40">
                      {user.email}
                    </span>
                  </div>
                </li>
                <li>
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="rounded py-3 font-semibold transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.INTEGRATIONS}
                    className="rounded py-3 font-semibold transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.SETTINGS}
                    className="rounded py-3 font-semibold transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    Account Settings
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <motion.button
              onClick={() => loginWithRedirect()}
              className="btn btn-primary btn-md hidden rounded shadow-lg shadow-primary/10 sm:flex"
              whileHover={{ y: -2, scale: 1.01, transition: SOFT_SPRING }}
              whileTap={TAP_PRESS}
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
