import { useState, useEffect, useCallback } from 'react';
import { get } from '@/utils/api';
import { useDemo } from '@/context/DemoContext';

export interface UsageStats {
  certificatesThisMonth: number;
  batchJobsThisMonth: number;
  storageUsedBytes: number;
  periodStart: string;
  periodEnd: string;
}

export const useUsageStats = () => {
  const { isDemoMode } = useDemo();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isDemoMode) {
      setStats({
        certificatesThisMonth: 847,
        batchJobsThisMonth: 12,
        storageUsedBytes: 2576980377,
        periodStart: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString(),
        periodEnd: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await get<UsageStats>('/usage');
      setStats(response.data ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load usage stats'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, isLoading, error, refresh: load };
};
