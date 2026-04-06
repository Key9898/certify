export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg';
export type LoadingVariant = 'spinner' | 'dots' | 'ring' | 'skeleton';

export interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullPage?: boolean;
}
