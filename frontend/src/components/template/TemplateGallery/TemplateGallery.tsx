import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { TemplateCard } from '../TemplateCard';
import { Skeleton } from '@/components/common/Skeleton';
import { TEMPLATE_CATEGORIES } from '@/utils/constants';
import type { TemplateGalleryProps } from './TemplateGallery.types';
import type { Template } from '@/types';
import { QUICK_SPRING, REVEAL_ITEM, STAGGER_CONTAINER, TAP_PRESS } from '@/utils/motion';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered =
    activeCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card bg-base-100 border border-base-200 p-0 overflow-hidden shadow-sm">
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
    <div>
      {/* Category Filter Tabs */}
      <LayoutGroup>
        <div className="mb-8 flex w-fit flex-wrap gap-2 rounded bg-base-200/50 p-2">
          {TEMPLATE_CATEGORIES.map(({ value, label }) => {
            const isActive = activeCategory === value;

            return (
              <motion.button
                key={value}
                className={`relative min-h-[44px] overflow-hidden px-5 py-2.5 text-sm font-black uppercase tracking-widest ${
                  isActive ? 'text-primary-content' : 'text-base-content/40'
                }`}
                onClick={() => setActiveCategory(value)}
                whileTap={TAP_PRESS}
              >
                {isActive ? (
                  <motion.span
                    layoutId="template-category-pill"
                    className="absolute inset-0 rounded bg-primary shadow-lg shadow-primary/20"
                    transition={QUICK_SPRING}
                  />
                ) : (
                  <motion.span
                    className="absolute inset-0 rounded"
                    whileHover={{ backgroundColor: 'rgba(226,232,240,0.85)' }}
                    transition={QUICK_SPRING}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.length === 0 ? (
            <div className="bg-base-100 border-2 border-dashed border-base-300 rounded text-center py-24 text-base-content/20">
              <p className="text-xl font-black italic tracking-tight">No Templates Found</p>
              <p className="text-sm font-medium">Try another category</p>
            </div>
          ) : (
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((template: Template) => (
                <motion.div key={template._id} variants={REVEAL_ITEM}>
                  <TemplateCard
                  key={template._id}
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
    </div>
  );
};
