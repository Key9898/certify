import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { QUICK_SPRING } from '@/utils/motion';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-[100] h-14 w-14 rounded bg-primary text-white shadow-2xl flex items-center justify-center border-none cursor-pointer group"
          aria-label="Scroll to top"
          transition={QUICK_SPRING}
        >
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded bg-primary/20"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ArrowUp
            size={24}
            className="relative z-10 transition-transform group-hover:translate-y-[-2px]"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
