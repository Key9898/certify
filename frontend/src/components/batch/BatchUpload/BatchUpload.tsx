import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCsvFile } from '@/utils/csvParser';
import type { BatchUploadProps } from './BatchUpload.types';
import { QUICK_SPRING, SOFT_SPRING } from '@/utils/motion';

const MAX_SIZE = 5 * 1024 * 1024;

export const BatchUpload: React.FC<BatchUploadProps> = ({
  onParsed,
  isLoading,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [parsedFile, setParsedFile] = useState<{
    name: string;
    rowCount: number;
  } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);
      setParsedFile(null);

      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!['.csv', '.xlsx'].includes(ext)) {
        setLocalError(
          'Invalid file type. Only CSV and XLSX files are allowed.'
        );
        return;
      }
      if (file.size > MAX_SIZE) {
        setLocalError('File too large. Maximum size is 5MB.');
        return;
      }

      try {
        const rows = await parseCsvFile(file);
        if (rows.length === 0) {
          setLocalError('File is empty or has no valid data rows.');
          return;
        }
        setParsedFile({ name: file.name, rowCount: rows.length });
        onParsed(rows, file);
      } catch {
        setLocalError('Failed to parse file. Please check the format.');
      }
    },
    [onParsed]
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
    <div className="w-full">
      <motion.div
        className={[
          'cursor-pointer rounded border border-dashed p-10 text-center outline-none selection:bg-primary/10',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-base-300 hover:border-primary/50 hover:bg-base-200/20',
          isLoading ? 'opacity-50 pointer-events-none' : '',
          displayError ? 'border-error bg-error/5' : '',
          parsedFile ? 'border-success bg-success/5' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !isLoading && inputRef.current?.click()}
        animate={{ scale: dragOver ? 1.01 : 1 }}
        transition={SOFT_SPRING}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="text-base-content/60 text-xs font-bold uppercase tracking-widest">
              Parsing Data...
            </p>
          </div>
        ) : parsedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SOFT_SPRING}
              className="bg-success/10 text-success p-3 rounded shadow-sm border border-success/20"
            >
              <CheckCircle size={32} />
            </motion.div>
            <div>
              <p className="font-black text-base-content tracking-tight">
                {parsedFile.name}
              </p>
              <p className="text-success text-xs font-bold uppercase tracking-widest mt-2">
                {parsedFile.rowCount} recipients found
              </p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 hover:text-primary transition-colors">
              Click to reset file
            </p>
          </motion.div>
        ) : (
          <motion.div
            animate={{ y: dragOver ? -4 : 0 }}
            transition={SOFT_SPRING}
            className="flex flex-col items-center gap-5 py-2"
          >
            <motion.div
              animate={{ scale: dragOver ? 1.1 : 1, rotate: dragOver ? -3 : 0 }}
              transition={QUICK_SPRING}
            >
              <FileSpreadsheet
                size={48}
                className={dragOver ? 'text-primary' : 'text-base-content/20'}
              />
            </motion.div>
            <div>
              <p className="text-base-content font-black tracking-tight text-lg mb-1">
                <span className="text-primary hover:underline">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-base-content/40 text-sm font-medium">
                Accepts CSV or XLSX (Max 5MB)
              </p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-base-content/30 border border-base-200 px-3 py-1.5 rounded bg-base-100">
              Required: name, title, issuer, date
            </div>
          </motion.div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          disabled={isLoading}
          aria-label="Upload CSV or XLSX file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </motion.div>

      {displayError && (
        <div className="alert alert-error mt-4 rounded border-none shadow-lg shadow-error/10 text-error-content py-3">
          <AlertCircle size={18} />
          <span className="text-sm font-bold">{displayError}</span>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-base-200">
        <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">
          Supported Columns
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            { label: 'Recipient Name', cols: 'name, recipientName' },
            { label: 'Certificate Title', cols: 'title, certificateTitle' },
            { label: 'Issuer Information', cols: 'issuer, issuerName' },
            { label: 'Issue Date', cols: 'date, issueDate' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-base-200/50 p-3 rounded flex flex-col gap-1 border border-base-200/50"
            >
              <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">
                {item.label}
              </span>
              <span className="text-xs font-mono text-primary font-bold">
                {item.cols}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-base-content/30 mt-4 italic">
          Optional: email, description
        </p>
      </div>
    </div>
  );
};
