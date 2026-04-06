import React, { useState } from 'react';
import { CheckCircle, Clock, Download, Loader, XCircle, Search, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BatchProgressProps } from './BatchProgress.types';
import type { BatchResult } from '@/types/batch';
import { downloadBatchZip } from '@/utils/batchApi';
import { QUICK_SPRING, TAP_PRESS, STAGGER_CONTAINER, REVEAL_ITEM, SOFT_SPRING } from '@/utils/motion';

const statusIcon = {
  pending: <Clock size={16} className="text-warning" />,
  processing: (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
    >
      <Loader size={16} className="text-primary" />
    </motion.span>
  ),
  completed: <CheckCircle size={16} className="text-success" />,
  failed: <XCircle size={16} className="text-error" />,
};

const statusLabel = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

const ResultRow: React.FC<{ result: BatchResult; index: number }> = ({ result, index }) => (
  <motion.tr
    variants={REVEAL_ITEM}
    whileHover={{ backgroundColor: 'rgba(226,232,240,0.4)' }}
    className="group"
  >
    <td className="pl-6 meta-label">
      {String(index + 1).padStart(2, '0')}
    </td>
    <td className="font-bold tracking-tight text-base-content">{result.recipientName}</td>
    <td>
      <span
        className={`badge badge-sm rounded-none border-none px-3 font-black uppercase tracking-widest ${
          result.status === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}
      >
        {result.status}
      </span>
    </td>
    <td className="pr-6 text-right">
      {result.pdfUrl ? (
        <motion.a
          href={result.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:underline"
          whileHover={{ x: 2 }}
          transition={QUICK_SPRING}
        >
          View Record
        </motion.a>
      ) : result.error ? (
        <span className="text-[10px] font-bold italic leading-tight text-error">
          {result.error}
        </span>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/20">
          -
        </span>
      )}
    </td>
  </motion.tr>
);

export const BatchProgress: React.FC<BatchProgressProps> = ({ job }) => {
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const hasPdfs = job.results.some((result) => result.status === 'success' && result.pdfUrl);

  const handleDownloadZip = async () => {
    setZipLoading(true);
    setZipError(null);

    try {
      await downloadBatchZip(job._id);
    } catch {
      setZipError('Failed to download ZIP. Please try again.');
    } finally {
      setZipLoading(false);
    }
  };

  const percent =
    job.totalCertificates > 0
      ? Math.round((job.processedCertificates / job.totalCertificates) * 100)
      : 0;

  const successCount = job.results.filter((result) => result.status === 'success').length;
  const failedCount = job.results.filter((result) => result.status === 'failed').length;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SOFT_SPRING}
        className="glass-card overflow-hidden p-8"
      >
        <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-base-200/50 text-base-content shadow-inner">
              {statusIcon[job.status]}
            </div>
            <div>
              <p className="meta-label mb-1">Engine Status</p>
              <h3 className="text-xl font-black tracking-tight text-base-content">
                {statusLabel[job.status]}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-8 text-right">
            <div>
              <p className="meta-label mb-1 text-right">Throughput</p>
              <p className="text-xl font-black tracking-tight text-base-content">
                {job.processedCertificates} <span className="text-base-content/20">/</span> {job.totalCertificates}
              </p>
            </div>
            <div>
              <p className="meta-label mb-1 text-right">Success Rate</p>
              <p className="text-xl font-black tracking-tight text-success">
                {job.totalCertificates > 0 ? Math.round((successCount / job.totalCertificates) * 100) : 0}%
              </p>
            </div>
            {failedCount > 0 && (
              <div>
                <p className="meta-label mb-1 text-right text-error/60">Anomalies</p>
                <p className="text-xl font-black tracking-tight text-error">
                  {failedCount}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-base-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            className={`h-full ${
              job.status === 'completed'
                ? 'bg-success'
                : job.status === 'failed'
                  ? 'bg-error'
                  : 'bg-primary'
            }`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="meta-label text-base-content/40">
            {percent}% Completed
          </span>
          <div className="flex items-center gap-6">
            <AnimatePresence>
              {job.status === 'completed' && hasPdfs && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="btn btn-primary h-10 rounded-sm px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  onClick={handleDownloadZip}
                  disabled={zipLoading}
                  whileHover={zipLoading ? undefined : { y: -2 }}
                  whileTap={zipLoading ? undefined : TAP_PRESS}
                  transition={QUICK_SPRING}
                >
                  {zipLoading ? (
                    <span className="loading loading-spinner loading-xs mr-2" />
                  ) : (
                    <Download size={14} className="mr-2" />
                  )}
                  Export Batch (.ZIP)
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {job.results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden rounded border border-base-200 bg-base-100 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-base-200 bg-base-200/5 px-8 py-5">
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-base-content">
                Traceability Audit
              </h3>
            </div>
            <div className="flex items-center gap-2 text-base-content/20">
              <Search size={14} />
              <span className="meta-label">
                {job.results.length} Entities Indexed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-base-200 bg-base-200/5">
                  <th className="pl-6 meta-label py-4">Idx</th>
                  <th className="meta-label py-4">Recipient Identity</th>
                  <th className="meta-label py-4">Verification Status</th>
                  <th className="pr-6 text-right meta-label py-4">Ledger Action</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="visible"
                className="divide-y divide-base-200"
              >
                {job.results.map((result, index) => (
                  <ResultRow key={index} result={result} index={index} />
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Errors */}
      <div className="space-y-3">
        <AnimatePresence>
          {(job.errorMessage || zipError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="alert alert-error rounded border-none font-bold shadow-lg shadow-error/10"
            >
              <XCircle size={18} />
              <span>{job.errorMessage || zipError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
