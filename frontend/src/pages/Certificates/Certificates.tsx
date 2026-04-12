import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  FileText,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CertificateList } from '@/components/certificate/CertificateList';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useCertificates } from '@/hooks/useCertificates';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/utils/constants';
import type { Certificate } from '@/types';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

export const Certificates: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const {
    certificates,
    isLoading,
    error,
    pagination,
    reload,
    remove,
    generateCertificatePdf,
  } = useCertificates({ search: debouncedSearch || undefined, page });
  const readyCount = certificates.filter((certificate) =>
    Boolean(certificate.pdfUrl)
  ).length;

  const handleDownload = useCallback(
    async (cert: Certificate) => {
      if (cert.pdfUrl) {
        window.open(cert.pdfUrl, '_blank');
        return;
      }
      setGeneratingPdfId(cert._id);
      try {
        const pdfUrl = await generateCertificatePdf(cert._id);
        if (pdfUrl) window.open(pdfUrl, '_blank');
      } catch {
        // error handled silently
      } finally {
        setGeneratingPdfId(null);
      }
    },
    [generateCertificatePdf]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget._id);
    } catch {
      // error handled silently
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, remove]);

  const handleSearchClear = () => {
    setSearchInput('');
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="mb-10"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                <Sparkles size={14} />
                Certificate Records
              </div>
              <h1 className="text-4xl font-black tracking-tight text-base-content md:text-5xl">
                Records Repository
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-base-content/60">
                Manage, verify, and export individual certificate records. Every
                certificate is hashed and indexed for rapid retrieval.
              </p>
            </div>
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={TAP_PRESS}
              transition={QUICK_SPRING}
            >
              <Link
                to={ROUTES.TEMPLATES}
                className="btn btn-primary h-14 rounded px-10 text-[13px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                <Plus size={20} className="mr-2" />
                Create New
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SOFT_SPRING, delay: 0.1 }}
          className="mb-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]"
        >
          <motion.div
            whileHover={{ y: -2, transition: SOFT_SPRING }}
            className="rounded border border-base-200 bg-base-100/95 p-3 shadow-sm backdrop-blur"
          >
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by recipient name or record title..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="input input-bordered h-12 w-full rounded border-base-200 bg-base-100 pl-11 pr-11 text-sm font-medium shadow-sm transition-[border-color,box-shadow] focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                aria-label="Search records"
              />
              <AnimatePresence>
                {searchInput && (
                  <motion.button
                    key="clear-search"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost rounded bg-base-200/50 hover:bg-base-200"
                    onClick={handleSearchClear}
                    aria-label="Clear search"
                    whileHover={{ rotate: 90 }}
                    transition={QUICK_SPRING}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-[auto_auto_auto]">
            <div className="flex items-center gap-2 rounded border border-base-200 bg-base-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-base-content/40 shadow-sm">
              <Filter size={14} />
              <span>{pagination.total} Records</span>
            </div>
            <div className="flex items-center justify-center rounded border border-success/20 bg-success/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-success shadow-sm">
              {readyCount} Ready On This Page
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1 rounded border border-base-200 bg-base-100 px-2 py-1 shadow-sm">
                <Button
                  variant="ghost"
                  className="h-8 w-8 min-w-0 p-0"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="px-2 text-[10px] font-black uppercase tracking-widest text-base-content/30">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 min-w-0 p-0"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert alert-error mb-8 rounded border-none font-bold"
          >
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-base-100/10 text-white"
              onClick={reload}
            >
              Retry
            </Button>
          </motion.div>
        )}

        <motion.div
          key={`${debouncedSearch}-${page}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SOFT_SPRING, delay: 0.2 }}
        >
          <CertificateList
            certificates={certificates}
            isLoading={isLoading}
            onDownload={handleDownload}
            onDelete={setDeleteTarget}
            generatingPdfId={generatingPdfId ?? undefined}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...SOFT_SPRING, delay: 1 }}
          className="fixed bottom-8 right-8 z-40 lg:hidden"
        >
          <Link
            to={ROUTES.TEMPLATES}
            className="btn btn-primary h-14 w-14 rounded p-0 shadow-2xl"
          >
            <Plus size={24} />
          </Link>
        </motion.div>

        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Archive Verification Record"
          size="sm"
          footer={
            <div className="flex w-full justify-end gap-3">
              <Button
                variant="ghost"
                className="font-bold uppercase tracking-widest text-xs"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                className="px-6 font-black uppercase tracking-widest text-xs shadow-lg shadow-error/10"
                onClick={handleDeleteConfirm}
              >
                Archive Record
              </Button>
            </div>
          }
        >
          <div className="py-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-error/10 text-error">
              <FileText size={32} />
            </div>
            <h3 className="text-center text-xl font-black tracking-tight text-base-content">
              Permanent Deletion Request
            </h3>
            <p className="mt-4 text-center text-sm font-medium leading-relaxed text-base-content/60">
              Are you sure you want to remove the record for{' '}
              <span className="font-black text-base-content">
                {deleteTarget?.recipientName}
              </span>
              ?
              <br />
              This data will be purged from the dashboard immutable history.
            </p>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
