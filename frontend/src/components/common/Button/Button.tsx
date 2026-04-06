import React from 'react';
import { motion } from 'framer-motion';
import type { ButtonProps } from './Button.types';
import { HOVER_LIFT, TAP_PRESS } from '@/utils/motion';

const variantMap: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  error: 'btn-error',
  success: 'btn-success',
  warning: 'btn-warning',
  outline: 'btn-outline',
};

const sizeMap: Record<string, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'btn',
    variantMap[variant],
    sizeMap[size],
    fullWidth ? 'w-full' : '',
    isLoading ? 'loading loading-spinner' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      whileHover={disabled || isLoading ? undefined : HOVER_LIFT}
      whileTap={disabled || isLoading ? undefined : TAP_PRESS}
      {...props}
    >
      {!isLoading && leftIcon && <span className="mr-1">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-1">{rightIcon}</span>}
    </motion.button>
  );
};
