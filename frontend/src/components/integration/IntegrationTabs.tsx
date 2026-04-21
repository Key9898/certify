import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Settings, BookOpen } from 'lucide-react';
import type { IntegrationTabId, IntegrationTab } from './integration.types';
import { TAP_PRESS } from '@/utils/motion';

interface IntegrationTabsProps {
  activeTab: IntegrationTabId;
  onTabChange: (tab: IntegrationTabId) => void;
  stats?: {
    total: number;
    active: number;
  };
}

const tabs: IntegrationTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard size={18} />,
    description: 'Dashboard and quick actions',
  },
  {
    id: 'create',
    label: 'Create New',
    icon: <PlusCircle size={18} />,
    description: 'Set up a new integration',
  },
  {
    id: 'manage',
    label: 'Manage',
    icon: <Settings size={18} />,
    description: 'View and edit integrations',
  },
  {
    id: 'docs',
    label: 'Documentation',
    icon: <BookOpen size={18} />,
    description: 'Guides and references',
  },
];

export const IntegrationTabs: React.FC<IntegrationTabsProps> = ({
  activeTab,
  onTabChange,
  stats,
}) => {
  return (
    <div className="mb-8">
      <LayoutGroup id="integrations-tabs-group">
        <div className="flex flex-wrap gap-2 rounded border border-base-200 bg-base-100/80 p-2 shadow-sm backdrop-blur">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === 'manage' && stats && stats.total > 0;

            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={TAP_PRESS}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex min-h-[44px] items-center gap-2 overflow-hidden rounded px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-content'
                    : 'text-base-content/45 hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="integrations-tab-pill"
                    className="absolute inset-0 rounded bg-primary shadow-lg shadow-primary/20"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                {!isActive && (
                  <motion.span
                    className="absolute inset-0 rounded bg-transparent"
                    whileHover={{ backgroundColor: 'rgba(59,130,246,0.12)' }}
                    transition={{ duration: 0.15 }}
                  />
                )}
                <span
                  className={`relative z-10 ${isActive ? 'text-primary-content' : ''}`}
                >
                  {tab.icon}
                </span>
                <span className="relative z-10">{tab.label}</span>
                {showBadge && (
                  <span
                    className={`relative z-10 ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-primary-content/20 text-primary-content'
                        : 'bg-base-200 text-base-content/60'
                    }`}
                  >
                    {stats!.total}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
};
