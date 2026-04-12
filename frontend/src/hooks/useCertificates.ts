import { useState, useEffect, useCallback } from 'react';
import {
  fetchCertificates,
  deleteCertificate,
  generatePdf,
} from '@/utils/certificateApi';
import { useDemo } from '@/context/DemoContext';
import type { Certificate } from '@/types';

export const useCertificates = (params?: {
  search?: string;
  page?: number;
}) => {
  const { isDemoMode, mockCertificates, setMockCertificates } = useDemo();
  const search = params?.search;
  const page = params?.page;
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // Sync mock certificates into local state when in demo mode
  useEffect(() => {
    if (!isDemoMode) return;
    const q = search?.toLowerCase() || '';
    const filtered = q
      ? mockCertificates.filter(
          (c) =>
            c.recipientName.toLowerCase().includes(q) ||
            c.certificateTitle.toLowerCase().includes(q)
        )
      : mockCertificates;
    setCertificates(filtered);
    setPagination({
      total: filtered.length,
      page: 1,
      limit: 12,
      totalPages: 1,
    });
    setIsLoading(false);
  }, [isDemoMode, mockCertificates, search]);

  const load = useCallback(async () => {
    if (isDemoMode) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCertificates({ search, page });
      setCertificates(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load certificates'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, search, page]);

  useEffect(() => {
    if (isDemoMode) return;
    load();
  }, [load, isDemoMode]);

  const remove = useCallback(
    async (id: string) => {
      if (isDemoMode) {
        setMockCertificates((prev) => prev.filter((c) => c._id !== id));
        return;
      }
      await deleteCertificate(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    },
    [isDemoMode, setMockCertificates]
  );

  const generateCertificatePdf = useCallback(
    async (id: string) => {
      if (isDemoMode) return undefined;
      const result = await generatePdf(id);
      if (result.data?.pdfUrl) {
        setCertificates((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, pdfUrl: result.data?.pdfUrl } : c
          )
        );
      }
      return result.data?.pdfUrl;
    },
    [isDemoMode]
  );

  return {
    certificates,
    isLoading,
    error,
    pagination,
    reload: load,
    remove,
    generateCertificatePdf,
  };
};
