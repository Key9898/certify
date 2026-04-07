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
  LogOut,
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useAppUser } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import type { SidebarProps } from './Sidebar.types';
import { QUICK_SPRING, SOFT_SPRING } from '@/utils/motion';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.CERTIFICATES, label: 'Ledger', icon: Award },
  { to: ROUTES.TEMPLATES, label: 'Library', icon: FileText },
  { to: ROUTES.CREATE_CERTIFICATE, label: 'Instant Issue', icon: Plus },
  { to: ROUTES.BATCH_GENERATE, label: 'Batch Flow', icon: Users },
  { to: ROUTES.INTEGRATIONS, label: 'Automation', icon: Webhook },
  { to: ROUTES.SETTINGS, label: 'Admin Tools', icon: Settings },
];

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', damping: 20, stiffness: 200 }
  },
} as const;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout, user } = useAuth0();
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
      className="flex h-full flex-col overflow-y-auto bg-base-100"
    >
      <Link
        to={ROUTES.HOME}
        className="hidden h-16 items-center gap-3 border-b border-base-200 px-6 hover:bg-base-200/50 lg:flex"
      >
        {brandLogo ? (
          <img src={brandLogo} alt={`${brandName} logo`} className="h-9 w-auto object-contain" />
        ) : (
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={QUICK_SPRING}
            className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
          >
            <img src="/Logo/logo.svg" alt="Certify" className="h-5 w-5 brightness-0 invert" />
          </motion.div>
        )}
        <span className="text-xl font-black tracking-tighter text-base-content whitespace-nowrap">
          {brandName}
        </span>
      </Link>

      <div className="flex items-center justify-between border-b border-base-200 px-6 py-4 lg:hidden">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
           <img src="/Logo/logo.svg" alt="Certify" className="h-5 w-5" />
           <span className="text-lg font-black tracking-tighter">{brandName}</span>
        </Link>
        <button onClick={onClose} className="btn btn-ghost btn-sm rounded">
           <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6">
        <LayoutGroup>
          <motion.ul 
             variants={STAGGER_CONTAINER}
             initial="hidden"
             animate="visible"
             className="menu menu-md w-full gap-1 p-0"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <motion.li key={to} variants={ITEM_VARIANTS}>
                <NavLink to={to} onClick={onClose} className="block p-0 no-underline">
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-3 overflow-hidden rounded px-4 py-2.5 text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-content shadow shadow-primary/20'
                          : 'text-base-content/60 hover:bg-base-200'
                      }`}
                    >
                      {isActive && (
                         <motion.div
                           layoutId="sidebar-active"
                           className="absolute left-0 h-1/2 w-1 rounded-r bg-primary-content/60"
                           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                         />
                      )}
                      <Icon size={18} />
                      {label}
                    </motion.div>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
        </LayoutGroup>
      </nav>

      <div className="mt-auto border-t border-base-200 p-4">
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="rounded bg-base-200/50 p-4 mb-4"
        >
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-primary-content font-bold">
                 {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                 <p className="text-sm font-bold truncate">{user?.name || 'Operator'}</p>
                 <p className="text-[10px] font-black uppercase tracking-wider text-base-content/40">Premium Account</p>
              </div>
           </div>
        </motion.div>
        <motion.button
          whileHover={{ x: 2 }}
          onClick={handleLogout}
          className="btn btn-ghost btn-sm w-full justify-start gap-3 text-error hover:bg-error/10"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col overflow-hidden border-r border-base-200 bg-base-100 lg:flex">
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
