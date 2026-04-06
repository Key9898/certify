import React from 'react';
import type { TemplatePreviewProps } from './TemplatePreview.types';

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-info/10 border-info',
  corporate: 'bg-primary/10 border-primary',
  event: 'bg-accent/10 border-accent',
  general: 'bg-secondary/10 border-secondary',
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, className = '' }) => {
  return (
    <div className={`rounded overflow-hidden border ${CATEGORY_COLORS[template.category]} ${className}`}>
      <img
        src={template.thumbnail}
        alt={`${template.name} preview`}
        className="w-full object-cover"
      />
      <div className="p-3">
        <p className="font-semibold text-sm text-base-content">{template.name}</p>
        <p className="text-xs text-base-content/60 capitalize">{template.category}</p>
      </div>
    </div>
  );
};
