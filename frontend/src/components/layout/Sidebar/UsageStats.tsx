import React from 'react';
import { motion } from 'framer-motion';
import { useUsageStats } from '@/hooks/useUsageStats';
import { QUICK_SPRING } from '@/utils/motion';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const UsageStats: React.FC = () => {
  const { stats, isLoading } = useUsageStats();

  if (isLoading || !stats) {
    return (
      <div className="rounded-lg border border-base-200 bg-base-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    );
  }

  const certificateLimit = 1000;
  const storageLimit = 5 * 1024 * 1024 * 1024;
  const certificatePercent = Math.min(
    (stats.certificatesThisMonth / certificateLimit) * 100,
    100
  );
  const storagePercent = Math.min(
    (stats.storageUsedBytes / storageLimit) * 100,
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={QUICK_SPRING}
      className="rounded-lg border border-base-200 bg-base-100 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-base-content/60">
          This Month
        </span>
        <span className="badge badge-sm gap-1 border-base-200 bg-base-100 text-[10px] font-bold text-base-content/50">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Real-time
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-base-content/50">
              Certificates
            </span>
            <span className="text-sm font-bold text-base-content">
              {formatNumber(stats.certificatesThisMonth)} /{' '}
              {formatNumber(certificateLimit)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${certificatePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-base-content/30"
            />
          </div>
          <div className="mt-1 text-right">
            <span className="text-[10px] font-medium text-base-content/40">
              {Math.round(certificatePercent)}%
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-medium text-base-content/50">
              Storage
            </span>
            <span className="text-sm font-bold text-base-content">
              {formatBytes(stats.storageUsedBytes)} /{' '}
              {formatBytes(storageLimit)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="h-full rounded-full bg-base-content/30"
            />
          </div>
          <div className="mt-1 text-right">
            <span className="text-[10px] font-medium text-base-content/40">
              {Math.round(storagePercent)}%
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-base-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/50">
              Batch Jobs
            </span>
            <span className="text-sm font-bold text-base-content">
              {formatNumber(stats.batchJobsThisMonth)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
