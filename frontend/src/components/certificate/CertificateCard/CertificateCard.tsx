import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Award, Calendar, User, MoreVertical } from 'lucide-react';
import { formatDateShort } from '@/utils/formatters';
import { Dropdown } from '@/components/common/Dropdown';
import type { CertificateCardProps } from './CertificateCard.types';
import { HOVER_LIFT, QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onDelete,
  isGeneratingPdf = false,
}) => {
  const dropdownItems = [
    ...(onDownload
      ? [{ label: certificate.pdfUrl ? 'Download PDF' : 'Generate & Download PDF', icon: <Download size={15} />, onClick: () => onDownload(certificate) }]
      : []),
    ...(onDelete
      ? [{ label: 'Delete', icon: <Trash2 size={15} />, onClick: () => onDelete(certificate), variant: 'error' as const }]
      : []),
  ];

  return (
    <motion.div
      className="card bg-base-100 border border-base-200"
      whileHover={HOVER_LIFT}
      transition={SOFT_SPRING}
      layout
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-primary/10 rounded-lg p-2 shrink-0">
              <Award size={18} className="text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-base-content truncate">
                {certificate.certificateTitle}
              </h3>
              <p className="text-xs text-base-content/60 font-mono">{certificate.certificateId}</p>
            </div>
          </div>
          {dropdownItems.length > 0 && (
              <Dropdown
                trigger={
                <motion.button
                  className="btn btn-ghost btn-circle h-11 min-h-11 w-11 min-w-11 md:btn-xs md:h-6 md:min-h-6 md:w-6 md:min-w-6"
                  aria-label="Certificate actions"
                  whileHover={{ rotate: 90, transition: QUICK_SPRING }}
                  whileTap={TAP_PRESS}
                >
                  <MoreVertical size={16} />
                </motion.button>
                }
                items={dropdownItems}
                align="end"
            />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <User size={14} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{certificate.recipientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Calendar size={14} aria-hidden="true" className="shrink-0" />
            <span>{formatDateShort(certificate.issueDate)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-200">
          <span className={`badge badge-sm ${certificate.pdfUrl ? 'badge-success' : 'badge-ghost'}`}>
            {certificate.pdfUrl ? 'PDF Ready' : 'No PDF'}
          </span>
          {onDownload && (
            <motion.button
              className={`btn btn-primary h-11 min-h-11 gap-1 px-3 md:btn-xs md:h-6 md:min-h-6 ${isGeneratingPdf ? 'loading loading-spinner' : ''}`}
              onClick={() => onDownload(certificate)}
              disabled={isGeneratingPdf}
              aria-label={`Download PDF for ${certificate.recipientName}`}
              whileHover={isGeneratingPdf ? undefined : { y: -2, transition: QUICK_SPRING }}
              whileTap={isGeneratingPdf ? undefined : TAP_PRESS}
            >
              {!isGeneratingPdf && <Download size={13} aria-hidden="true" />}
              {isGeneratingPdf ? 'Generating...' : 'PDF'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
