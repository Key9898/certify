import { useEffect, useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { fetchIntegrationCatalog, fetchIntegrations } from '@/utils/integrationApi';
import { INTEGRATION_CATALOG } from '@/utils/integrationCatalog';
import type { Integration, IntegrationCatalogItem } from '@/types';

export const useIntegrations = () => {
  const { isDemoMode, mockIntegrations } = useDemo();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [catalog, setCatalog] = useState<IntegrationCatalogItem[]>(INTEGRATION_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setIntegrations(mockIntegrations);
      setCatalog(INTEGRATION_CATALOG);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [catalogResult, integrationResult] = await Promise.all([
          fetchIntegrationCatalog().catch(() => ({ data: INTEGRATION_CATALOG })),
          fetchIntegrations(),
        ]);

        setCatalog(catalogResult.data || INTEGRATION_CATALOG);
        setIntegrations(integrationResult.data || []);
      } catch (err) {
        setCatalog(INTEGRATION_CATALOG);
        setError(err instanceof Error ? err.message : 'Failed to load integrations.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isDemoMode, mockIntegrations]);

  return { integrations, catalog, isLoading, error };
};
