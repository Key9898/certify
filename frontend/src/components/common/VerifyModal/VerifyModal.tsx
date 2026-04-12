import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { VerifySearchWidget } from '../VerifySearchWidget/VerifySearchWidget';
import { QUICK_SPRING } from '@/utils/motion';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-base-content/40 backdrop-blur-md" />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={QUICK_SPRING}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-base-100/80 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

              <div className="relative p-8">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-2 text-base-content/50 transition-colors hover:bg-base-200/50 hover:text-base-content"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>

                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-base-content">
                      Verify Certificate
                    </h2>
                    <p className="text-sm font-medium text-base-content/50">
                      Instantly validate authenticity
                    </p>
                  </div>
                </div>

                <VerifySearchWidget
                  variant="large"
                  placeholder="Enter Certificate ID (e.g., CERT-12345)"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
