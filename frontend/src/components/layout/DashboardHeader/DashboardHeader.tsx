import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, Bell, Webhook } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppUser } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { getAuthProfileDisplayName, getAuthProfileInitial } from '@/utils/formatters';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth0();
  const { appUser } = useAppUser();
  const brandName =
    appUser?.organization?.whiteLabel.brandName || appUser?.organization?.name || 'Certify';
  const displayName = getAuthProfileDisplayName(user);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SOFT_SPRING}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-base-200 bg-base-100/80 px-6 backdrop-blur-md md:px-8"
    >
      <div className="flex items-center gap-4">
        <motion.button
          className="btn btn-ghost btn-sm rounded lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          whileHover={{ y: -2, transition: QUICK_SPRING }}
          whileTap={TAP_PRESS}
        >
          <Menu size={20} />
        </motion.button>

        <div className="hidden items-center gap-2 lg:flex">
          <motion.div
            whileHover={{ y: -2, scale: 1.01, transition: SOFT_SPRING }}
            className="rounded border border-base-200 bg-base-100 px-3 py-1.5 shadow-sm"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
              Workspace
            </span>
            <span className="ml-2 font-bold text-base-content">{brandName}</span>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.div whileHover={{ y: -2, transition: QUICK_SPRING }} whileTap={TAP_PRESS}>
          <Link
            to={ROUTES.INTEGRATIONS}
            className="btn btn-sm btn-ghost hidden rounded px-4 font-bold md:inline-flex"
          >
            <Webhook size={16} />
            Integrations
          </Link>
        </motion.div>

        <motion.button
          className="btn btn-ghost rounded btn-sm relative text-base-content/60"
          whileHover={{ y: -2, transition: QUICK_SPRING }}
          whileTap={TAP_PRESS}
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-base-100" />
        </motion.button>

        <div className="mx-1 h-8 w-px bg-base-200" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-bold leading-tight text-base-content">{displayName}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">
              Premium User
            </span>
          </div>
          <motion.div
            whileHover={{ y: -2, scale: 1.03, transition: SOFT_SPRING }}
            className="btn btn-ghost rounded avatar p-0.5 ring-1 ring-primary/10 ring-offset-1 hover:ring-primary"
          >
            <div className="w-9 overflow-hidden rounded">
              {user?.picture ? (
                <img src={user.picture} alt={displayName || 'User avatar'} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-primary-content">
                  {getAuthProfileInitial(user)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
