import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}
