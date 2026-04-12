import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from './Modal.types';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={onClose}
    >
      <div
        className={`modal-box ${sizeMap[size]} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
        {title && (
          <h3 id="modal-title" className="text-lg font-bold mb-4">
            {title}
          </h3>
        )}
        <div>{children}</div>
        {footer && <div className="modal-action">{footer}</div>}
      </div>
    </div>
  );
};
