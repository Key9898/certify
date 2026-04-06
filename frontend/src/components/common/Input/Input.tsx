import React from 'react';
import type { InputProps } from './Input.types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-control ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <div className={leftAddon || rightAddon ? 'join w-full' : ''}>
        {leftAddon && <span className="join-item btn btn-outline">{leftAddon}</span>}
        <input
          id={inputId}
          className={[
            'input input-bordered',
            leftAddon || rightAddon ? 'join-item flex-1' : '',
            fullWidth ? 'w-full' : '',
            error ? 'input-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightAddon && <span className="join-item btn btn-outline">{rightAddon}</span>}
      </div>
      {error && (
        <label className="label" id={`${inputId}-error`}>
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {hint && !error && (
        <label className="label" id={`${inputId}-hint`}>
          <span className="label-text-alt text-base-content/60">{hint}</span>
        </label>
      )}
    </div>
  );
};
