import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImageIcon } from 'lucide-react';
import type { FileUploadProps } from './FileUpload.types';
import { QUICK_SPRING, SOFT_SPRING } from '@/utils/motion';

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*',
  maxSizeBytes = 2 * 1024 * 1024,
  onFileSelect,
  previewUrl,
  error,
  hint,
  isUploading = false,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);
      if (file.size > maxSizeBytes) {
        setLocalError(`File too large. Max size: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
        return;
      }
      onFileSelect(file);
    },
    [maxSizeBytes, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const displayError = error || localError;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <motion.div
        className={[
          'border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          displayError ? 'border-error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        animate={{
          scale: dragOver ? 1.01 : 1,
          borderColor: displayError ? 'var(--color-error)' : undefined,
        }}
        transition={SOFT_SPRING}
      >
        {previewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.img
              src={previewUrl}
              alt="Preview"
              className="max-h-24 max-w-full rounded object-contain"
              whileHover={{ scale: 1.04, transition: QUICK_SPRING }}
            />
            <span className="text-xs text-base-content/60">Click to change</span>
          </motion.div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="loading loading-spinner loading-md text-primary" />
            <span className="text-sm text-base-content/60">Uploading...</span>
          </div>
        ) : (
          <motion.div
            animate={{ y: dragOver ? -2 : 0 }}
            transition={SOFT_SPRING}
            className="flex flex-col items-center gap-2 py-2"
          >
            <motion.div
              animate={{ scale: dragOver ? 1.08 : 1, rotate: dragOver ? -4 : 0 }}
              transition={QUICK_SPRING}
            >
              {dragOver ? (
                <Upload size={28} className="text-primary" />
              ) : (
                <ImageIcon size={28} className="text-base-content/30" />
              )}
            </motion.div>
            <p className="text-sm text-base-content/60">
              <span className="text-primary font-medium">Click to upload</span> or drag & drop
            </p>
            {hint && <p className="text-xs text-base-content/40">{hint}</p>}
          </motion.div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          aria-label={label || 'File upload'}
        />
      </motion.div>
      {displayError && (
        <label className="label">
          <span className="label-text-alt text-error">{displayError}</span>
        </label>
      )}
    </div>
  );
};
