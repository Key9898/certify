export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}
