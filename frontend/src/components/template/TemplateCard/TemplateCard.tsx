import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { TemplateCardProps } from './TemplateCard.types';
import { HOVER_LIFT, QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

const CATEGORY_BADGE: Record<string, string> = {
  academic: 'badge-info',
  corporate: 'badge-primary',
  event: 'badge-accent',
  general: 'badge-ghost',
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected = false,
  onSelect,
}) => {
  return (
    <motion.div
      className={[
        'group relative card overflow-hidden bg-base-100 cursor-pointer',
        isSelected
          ? 'ring-4 ring-primary ring-offset-2 shadow-2xl scale-[1.02]'
          : 'border border-base-200 hover:border-primary/30 hover:shadow-xl',
      ].join(' ')}
      onClick={() => onSelect?.(template)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(template)}
      aria-pressed={isSelected}
      aria-label={`Select ${template.name} template`}
      whileHover={!isSelected ? HOVER_LIFT : undefined}
      whileTap={TAP_PRESS}
      layout
      transition={SOFT_SPRING}
    >
      <figure className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={template.thumbnail}
          alt={`${template.name} preview`}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08, transition: SOFT_SPRING }}
        />
        
        {/* Selection Overlay */}
        <AnimatePresence>
          {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={SOFT_SPRING}
              className="bg-white rounded-full p-2 shadow-xl"
            >
              <CheckCircle size={32} className="text-primary" />
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Overlay */}
        {!isSelected && (
          <motion.div
            initial={false}
            whileHover={{ backgroundColor: 'rgba(34, 42, 56, 0.12)' }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-base-content/0"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={QUICK_SPRING}
              className="rounded bg-primary/90 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md"
            >
              Click to Select
            </motion.div>
          </motion.div>
        )}

        <span className={`badge ${CATEGORY_BADGE[template.category]} absolute top-3 left-3 capitalize font-bold border-none px-3 py-3 z-20 shadow-md`}>
          {template.category}
        </span>
      </figure>
      
      <motion.div layout className="card-body relative z-20 bg-base-100 p-5">
        <motion.h3
          className="text-lg font-black tracking-tight text-base-content"
          animate={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-base-content)' }}
          transition={QUICK_SPRING}
        >
          {template.name}
        </motion.h3>
        <p className="text-sm font-medium text-base-content/50 line-clamp-2 leading-relaxed">
          {template.description}
        </p>
      </motion.div>
    </motion.div>
  );
};
