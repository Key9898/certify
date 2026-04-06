import { useState, useEffect } from 'react';
import { fetchTemplates } from '@/utils/templateApi';
import { useDemo } from '@/context/DemoContext';
import type { Template } from '@/types';

export const useTemplates = () => {
  const { isDemoMode, mockTemplates } = useDemo();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setTemplates(mockTemplates);
      setIsLoading(false);
      return;
    }

    const load = async () => {
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
    };
    load();
  }, [isDemoMode, mockTemplates]);

  return { templates, isLoading, error };
};
