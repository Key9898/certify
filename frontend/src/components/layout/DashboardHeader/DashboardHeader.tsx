import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { useAppUser } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';
import { AvatarDropdown } from './AvatarDropdown';
import { NotificationDropdown } from './NotificationDropdown';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuToggle,
}) => {
  const { appUser } = useAppUser();
  const brandName =
    appUser?.organization?.whiteLabel.brandName ||
    appUser?.organization?.name ||
    'Certify';

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
            <span className="ml-2 font-bold text-base-content">
              {brandName}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ y: -2, transition: QUICK_SPRING }}
          whileTap={TAP_PRESS}
        >
          <Link
            to={ROUTES.CREATE_CERTIFICATE}
            className="btn btn-sm btn-primary hidden rounded px-4 font-bold shadow-sm shadow-primary/20 md:inline-flex"
          >
            <Plus size={16} />
            Quick Create
          </Link>
        </motion.div>

        <NotificationDropdown />

        <div className="mx-1 h-8 w-px bg-base-200" />

        <AvatarDropdown />
      </div>
    </motion.header>
  );
};
