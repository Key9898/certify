import {
  User,
  Shield,
  Building2,
  Lock,
  Users,
  ChevronRight,
  Key,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SOFT_SPRING, QUICK_SPRING } from '@/utils/motion';
import type { SettingsTab } from './types';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const menuItems = [
    {
      id: 'general',
      label: 'Profile',
      icon: User,
      detail: 'Personal info & preferences',
    },
    {
      id: 'workspace',
      label: 'Team Members',
      icon: Users,
      detail: 'Manage team & roles',
    },
    {
      id: 'branding',
      label: 'White Labeling',
      icon: Building2,
      detail: 'Custom brand settings',
    },
    {
      id: 'developer',
      label: 'API & Integrations',
      icon: Key,
      detail: 'API keys & webhooks',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Lock,
      detail: 'Password & account safety',
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="px-4 py-2">
        <p className="meta-label">Configuration Protocol</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full group relative flex items-center gap-4 rounded p-4 transition-all border ${
                isActive
                  ? 'bg-primary/5 border-primary/20 shadow-sm shadow-primary/5'
                  : 'bg-transparent border-transparent hover:bg-base-200/50 grayscale hover:grayscale-0'
              }`}
              whileHover={{ x: 4 }}
              transition={QUICK_SPRING}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded transition-all ${
                  isActive
                    ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-110'
                    : 'bg-base-200 text-base-content/40'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p
                  className={`text-sm font-black tracking-tight transition-colors truncate ${
                    isActive
                      ? 'text-base-content'
                      : 'text-base-content/50 group-hover:text-base-content'
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest transition-opacity truncate ${
                    isActive
                      ? 'text-primary/60'
                      : 'text-base-content/30 group-hover:text-base-content/40'
                  }`}
                >
                  {item.detail}
                </p>
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 h-8 w-1.5 rounded-r-full bg-primary"
                  transition={SOFT_SPRING}
                />
              )}

              {!isActive && (
                <ChevronRight
                  size={14}
                  className="text-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-10 p-6 rounded bg-gradient-to-br from-primary/[0.08] to-accent/[0.05] border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 -rotate-12 translate-x-6 scale-150 group-hover:rotate-0 transition-transform">
          <Shield size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            Service Health
          </p>
          <p className="text-xs font-black text-base-content tracking-tight leading-relaxed">
            Your global workspace configuration is backed by Enterprise-grade
            AES-256 encryption.
          </p>
        </div>
      </div>
    </div>
  );
};
