import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  X,
  Award,
  Users,
  Webhook,
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useAppUser } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import type { SidebarProps } from './Sidebar.types';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.TEMPLATES, label: 'Templates', icon: FileText },
  { to: ROUTES.CREATE_CERTIFICATE, label: 'Create Certificate', icon: Plus },
  { to: ROUTES.BATCH_GENERATE, label: 'Batch Generate', icon: Users },
  { to: ROUTES.INTEGRATIONS, label: 'Integrations', icon: Webhook },
  { to: ROUTES.CERTIFICATES, label: 'Certificates', icon: Award },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth0();
  const { appUser } = useAppUser();
  const brandName =
    appUser?.organization?.whiteLabel.brandName || appUser?.organization?.name || 'Certify';
  const brandLogo = appUser?.organization?.whiteLabel.logoUrl;

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const sidebarContent = (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={SOFT_SPRING}
      className="flex h-full flex-col bg-base-100/50 backdrop-blur-xl"
    >
      <Link
        to={ROUTES.HOME}
        className="hidden h-16 items-center gap-3 border-b border-base-200 px-6 hover:bg-base-200/30 lg:flex"
      >
        {brandLogo ? (
          <img src={brandLogo} alt={`${brandName} logo`} className="h-9 w-auto object-contain" />
        ) : (
          <motion.div
            whileHover={{ rotate: -6, scale: 1.06, transition: QUICK_SPRING }}
            className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
          >
            <Award size={20} className="text-primary-content" />
          </motion.div>
        )}
        <motion.span
          className="text-xl font-black tracking-tighter text-base-content"
          whileHover={{ color: 'var(--color-primary)' }}
          transition={QUICK_SPRING}
        >
          {brandName}
        </motion.span>
      </Link>

      <div className="flex items-center justify-between border-b border-base-200 px-6 py-4 text-base-content lg:hidden">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          {brandLogo ? (
            <img src={brandLogo} alt={`${brandName} logo`} className="h-8 w-auto object-contain" />
          ) : (
            <motion.div whileHover={{ scale: 1.08 }} transition={QUICK_SPRING}>
              <Award size={20} className="text-primary" />
            </motion.div>
          )}
          <motion.span
            className="text-lg font-black"
            whileHover={{ color: 'var(--color-primary)' }}
            transition={QUICK_SPRING}
          >
            {brandName}
          </motion.span>
        </Link>
        <motion.button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={onClose}
          aria-label="Close menu"
          whileHover={{ rotate: 90, transition: QUICK_SPRING }}
          whileTap={TAP_PRESS}
        >
          <X size={18} />
        </motion.button>
      </div>

      <nav className="flex-1 px-3 py-6">
        <LayoutGroup>
          <ul className="menu menu-md w-full gap-1 p-0">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose} className="block">
                  {({ isActive }) => (
                    <motion.div
                      className={`relative flex items-center gap-3 overflow-hidden rounded px-4 py-2.5 text-sm font-bold ${
                        isActive
                          ? 'text-primary-content'
                          : 'text-base-content/60'
                      }`}
                      whileHover={
                        !isActive
                          ? { backgroundColor: 'rgba(226,232,240,0.55)', color: 'rgba(15,23,42,1)' }
                          : undefined
                      }
                      transition={QUICK_SPRING}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded bg-primary shadow shadow-primary/20"
                          transition={SOFT_SPRING}
                        />
                      ) : (
                        <span className="absolute inset-0 rounded bg-base-200/0" />
                      )}
                      <motion.span
                        whileHover={!isActive ? { x: 2, transition: QUICK_SPRING } : undefined}
                        className="relative z-10 flex items-center gap-3"
                      >
                        <Icon size={18} />
                        {label}
                      </motion.span>
                    </motion.div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </LayoutGroup>
      </nav>

      <div className="border-t border-base-200 p-3">
        <div className="rounded bg-base-200/50 p-2">
          <motion.button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm w-full justify-start gap-3 rounded font-bold text-error transition-colors hover:bg-error/10 hover:text-error"
            whileHover={{ x: 3, transition: QUICK_SPRING }}
            whileTap={TAP_PRESS}
          >
            <X size={18} />
            Sign Out
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-64 flex-col border-r border-base-200 lg:flex">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-[110] flex h-screen w-80 flex-col bg-base-100 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
