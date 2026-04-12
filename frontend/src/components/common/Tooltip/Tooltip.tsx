import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TooltipProps, TooltipPosition } from './Tooltip.types';

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-base-content border-x-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-base-content border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-base-content border-y-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-base-content border-y-transparent border-l-transparent',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} ${className}`}
          >
            <div className="rounded bg-base-content px-3 py-2 text-sm text-base-100 shadow-lg max-w-xs">
              {content}
            </div>
            <div className={`absolute border-4 ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
