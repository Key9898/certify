import { useState, useEffect, useCallback } from 'react';
import { fetchTemplates } from '@/utils/templateApi';
import { useDemo } from '@/context/DemoContext';
import type { Template } from '@/types';

export const useTemplates = () => {
  const { isDemoMode, mockTemplates } = useDemo();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    if (isDemoMode) {
      setTemplates(mockTemplates);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTemplates();
      setTemplates(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, mockTemplates]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return { templates, isLoading, error, refetch: loadTemplates };
};
