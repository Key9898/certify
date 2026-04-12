import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded',
    circle: 'h-12 w-12 rounded',
  };

  return (
    <motion.div
      className={`skeleton bg-base-300/50 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
      animate={{ opacity: [0.45, 0.9, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};
