import React from 'react';
import { motion } from 'framer-motion';
import {
  Webhook,
  Activity,
  Pause,
  Zap,
  ArrowRight,
  FileSpreadsheet,
  GraduationCap,
  Code,
  Plus,
} from 'lucide-react';
import type { IntegrationStats } from './integration.types';
import {
  REVEAL_ITEM,
  STAGGER_CONTAINER,
  QUICK_SPRING,
  TAP_PRESS,
} from '@/utils/motion';

interface IntegrationOverviewProps {
  stats: IntegrationStats;
  onCreateNew: () => void;
  onSelectProvider: (provider: 'google_sheets' | 'canvas' | 'custom') => void;
  onNavigate: (tab: 'overview' | 'create' | 'manage' | 'docs') => void;
}

export const IntegrationOverview: React.FC<IntegrationOverviewProps> = ({
  stats,
  onCreateNew,
  onSelectProvider,
  onNavigate,
}) => {
  const statCards = [
    {
      label: 'Total Integrations',
      value: stats.total,
      icon: Webhook,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Paused',
      value: stats.paused,
      icon: Pause,
      color: 'text-base-content/50',
      bgColor: 'bg-base-200',
    },
    {
      label: 'Total Runs',
      value: stats.totalRuns,
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const quickActions: Array<{
    title: string;
    description: string;
    icon: React.ElementType;
    provider: 'google_sheets' | 'canvas' | 'custom';
    color: string;
    bgColor: string;
  }> = [
    {
      title: 'Google Sheets',
      description: 'Connect to spreadsheets for batch certificate generation',
      icon: FileSpreadsheet,
      provider: 'google_sheets',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Canvas LMS',
      description: 'Integrate with Canvas for course completion certificates',
      icon: GraduationCap,
      provider: 'canvas',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Custom Webhook',
      description: 'Set up a custom webhook for your own systems',
      icon: Code,
      provider: 'custom',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.section variants={REVEAL_ITEM}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-base-content">Dashboard</h2>
          <p className="text-sm text-base-content/60">
            Overview of your integration activity
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-lg border border-base-200 bg-base-100 p-5"
              whileHover={{ y: -2 }}
              transition={QUICK_SPRING}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-base-content">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={REVEAL_ITEM}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-base-content">Quick Setup</h2>
          <p className="text-sm text-base-content/60">
            Create a new integration in minutes
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              onClick={() => onSelectProvider(action.provider)}
              className="group rounded-lg border border-base-200 bg-base-100 p-5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
              whileHover={{ y: -4 }}
              whileTap={TAP_PRESS}
              transition={QUICK_SPRING}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${action.bgColor}`}>
                  <action.icon size={24} className={action.color} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base-content group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {stats.total === 0 && (
        <motion.section variants={REVEAL_ITEM}>
          <div className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/30 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Webhook size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-base-content">
              No integrations yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-base-content/60">
              Create your first integration to start automating certificate
              generation with webhooks.
            </p>
            <motion.button
              onClick={() => onCreateNew()}
              className="btn btn-primary mt-6 rounded px-6 font-bold"
              whileHover={{ y: -2 }}
              whileTap={TAP_PRESS}
              transition={QUICK_SPRING}
            >
              <Plus size={16} />
              Create Integration
            </motion.button>
          </div>
        </motion.section>
      )}

      {stats.total > 0 && (
        <motion.section variants={REVEAL_ITEM}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Recent Activity
              </h2>
              <p className="text-sm text-base-content/60">
                Your latest integration runs
              </p>
            </div>
            <motion.button
              onClick={() => onNavigate('manage')}
              className="btn btn-ghost btn-sm rounded font-bold"
              whileHover={{ y: -2 }}
              whileTap={TAP_PRESS}
              transition={QUICK_SPRING}
            >
              View All
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};
