import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Inbox, Sparkles } from 'lucide-react';
import { QUICK_SPRING } from '@/utils/motion';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-ghost rounded btn-sm relative text-base-content/60 hover:text-base-content"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Notifications"
      >
        <Bell size={20} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-base-100" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border border-base-200 bg-base-100 shadow-xl shadow-base-300/20 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-base-200">
              <h3 className="text-sm font-bold text-base-content">
                Notifications
              </h3>
            </div>

            <div className="px-6 py-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, ...QUICK_SPRING }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
              >
                <Inbox size={24} className="text-primary" />
              </motion.div>
              <p className="text-sm font-bold text-base-content/70 mb-1">
                All caught up!
              </p>
              <p className="text-xs text-base-content/40">
                No new notifications at the moment
              </p>
            </div>

            <div className="px-4 py-3 border-t border-base-200 bg-base-50/50">
              <div className="flex items-center justify-center gap-1.5 text-xs text-base-content/40">
                <Sparkles size={12} />
                <span>Real-time notifications coming soon</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
