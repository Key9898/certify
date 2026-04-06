import type { Template } from '@/types';

export interface TemplateGalleryProps {
  templates: Template[];
  selectedId?: string;
  onSelect: (template: Template) => void;
  isLoading?: boolean;
}
