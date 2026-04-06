import React from 'react';
import { motion } from 'framer-motion';
import type { CardProps } from './Card.types';
import { HOVER_LIFT, QUICK_SPRING } from '@/utils/motion';

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  image,
  imageAlt,
  compact = false,
  bordered = true,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <motion.div
      className={[
        'card bg-base-100',
        bordered ? 'border border-base-200' : 'shadow-md',
        compact ? 'card-compact' : '',
        hoverable || onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      whileHover={hoverable || onClick ? HOVER_LIFT : undefined}
      transition={QUICK_SPRING}
    >
      {image && (
        <figure>
          <img src={image} alt={imageAlt || title || 'Card image'} className="w-full object-cover" />
        </figure>
      )}
      <div className="card-body">
        {(title || subtitle) && (
          <div>
            {title && <h2 className="card-title text-base-content">{title}</h2>}
            {subtitle && <p className="text-sm text-base-content/60">{subtitle}</p>}
          </div>
        )}
        {children}
        {actions && <div className="card-actions justify-end mt-2">{actions}</div>}
      </div>
    </motion.div>
  );
};
