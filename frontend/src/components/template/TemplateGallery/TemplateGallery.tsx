import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplateCard } from '../TemplateCard';
import { Skeleton } from '@/components/common/Skeleton';
import type { TemplateGalleryProps } from './TemplateGallery.types';
import type { Template } from '@/types';
import { REVEAL_ITEM, STAGGER_CONTAINER } from '@/utils/motion';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="card bg-base-100 border border-base-200 p-0 overflow-hidden shadow-sm"
          >
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton variant="text" className="w-2/3 h-5" />
              <Skeleton variant="text" className="w-full h-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {templates.length === 0 ? (
          <div className="bg-base-100 border-2 border-dashed border-base-300 rounded text-center py-24 text-base-content/20">
            <p className="text-xl font-black italic tracking-tight">
              No Templates Found
            </p>
            <p className="text-sm font-medium">Try another category</p>
          </div>
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {templates.map((template: Template) => (
              <motion.div key={template._id} variants={REVEAL_ITEM}>
                <TemplateCard
                  template={template}
                  isSelected={selectedId === template._id}
                  onSelect={onSelect}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
