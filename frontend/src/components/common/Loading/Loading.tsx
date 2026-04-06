import React from 'react';
import { motion } from 'framer-motion';
import type { LoadingProps } from './Loading.types';
import { MOTION_EASE } from '@/utils/motion';

const sizeMap = { xs: 'loading-xs', sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' };
const variantMap = {
  spinner: 'loading-spinner',
  dots: 'loading-dots',
  ring: 'loading-ring',
  skeleton: 'loading-spinner',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullPage = false,
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: MOTION_EASE }}
      className="flex flex-col items-center gap-2"
    >
      <span
        className={`loading ${variantMap[variant]} ${sizeMap[size]} text-primary`}
        aria-label="Loading"
        role="status"
      />
      {text && <p className="text-sm text-base-content/60">{text}</p>}
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
