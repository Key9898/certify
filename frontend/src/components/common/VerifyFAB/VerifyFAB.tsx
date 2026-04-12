import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { QUICK_SPRING } from '@/utils/motion';

interface VerifyFABProps {
  onClick: () => void;
}

export const VerifyFAB: React.FC<VerifyFABProps> = ({ onClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="fixed bottom-10 left-10 z-[100] h-14 w-14 rounded bg-primary text-white shadow-2xl flex items-center justify-center border-none cursor-pointer group"
          aria-label="Verify a certificate"
          transition={QUICK_SPRING}
        >
          <motion.div
            className="absolute inset-0 rounded bg-primary/20"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ShieldCheck
            size={24}
            className="relative z-10 transition-transform group-hover:scale-110"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
