import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { CertificateCard } from '../CertificateCard';
import { Skeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/utils/constants';
import type { CertificateListProps } from './CertificateList.types';
import { QUICK_SPRING, SOFT_SPRING, STAGGER_CONTAINER, REVEAL_ITEM } from '@/utils/motion';

export const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  isLoading = false,
  onDownload,
  onDelete,
  generatingPdfId,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card bg-base-100 border border-base-200 p-0 overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton variant="text" className="w-2/3 h-6" />
              <Skeleton variant="text" className="w-1/2 h-4" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-10 w-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SOFT_SPRING}
        className="flex flex-col items-center justify-center py-32 px-6 text-center bg-base-100/50 border border-dashed border-base-200 rounded"
      >
        <div className="relative mb-10">
          <div className="flex h-24 w-24 items-center justify-center rounded bg-primary/5 text-primary/20">
            <Inbox size={48} strokeWidth={1.5} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary"
          >
            <Plus size={16} />
          </motion.div>
        </div>
        
        <h3 className="text-3xl font-black text-base-content mb-4 tracking-tight text-center">Records Missing</h3>
        <p className="text-base-content/40 font-medium max-w-sm mb-10 leading-relaxed text-center">
          The registry hasn&apos;t indexed any credentials yet. Start your first issuance to populate this ledger.
        </p>

        <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
          <Link to={ROUTES.TEMPLATES} className="btn btn-primary h-14 rounded px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-2">
            <Plus size={20} />
            Begin Issuance
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {certificates.map((certificate) => (
        <motion.div
          key={certificate._id}
          variants={REVEAL_ITEM}
          whileHover={{ y: -6, transition: QUICK_SPRING }}
        >
          <CertificateCard
            certificate={certificate}
            onDownload={onDownload}
            onDelete={onDelete}
            isGeneratingPdf={generatingPdfId === certificate._id}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
