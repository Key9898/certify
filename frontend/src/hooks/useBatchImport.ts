import { useState, useCallback, useRef } from 'react';
import { parseCsvFile } from '@/utils/csvParser';
import { uploadBatchCsv, startBatchGeneration, fetchBatchStatus } from '@/utils/batchApi';
import type { BatchJob, BatchUploadPreview } from '@/types/batch';

type Step = 'idle' | 'preview' | 'processing' | 'done' | 'error';

interface UseBatchImportState {
  step: Step;
  preview: BatchUploadPreview | null;
  job: BatchJob | null;
  error: string | null;
  isLoading: boolean;
}

export const useBatchImport = () => {
  const [state, setState] = useState<UseBatchImportState>({
    step: 'idle',
    preview: null,
    job: null,
    error: null,
    isLoading: false,
  });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(
    (jobId: string) => {
      stopPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetchBatchStatus(jobId);
          const job = res.data!;
          setState((prev) => ({ ...prev, job }));

          if (job.status === 'completed' || job.status === 'failed') {
            stopPolling();
            setState((prev) => ({
              ...prev,
              step: 'done',
              isLoading: false,
            }));
          }
        } catch {
          stopPolling();
          setState((prev) => ({
            ...prev,
            step: 'error',
            error: 'Failed to fetch batch status.',
            isLoading: false,
          }));
        }
      }, 3000);
    },
    [stopPolling]
  );

  const parseLocalFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const rows = await parseCsvFile(file);
      if (rows.length === 0) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'File is empty or has no valid data rows.',
        }));
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        step: 'preview',
        preview: { total: rows.length, preview: rows.slice(0, 5), rows },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to parse file.',
      }));
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await uploadBatchCsv(file);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        step: 'preview',
        preview: res.data!,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Upload failed.',
      }));
    }
  }, []);

  const startGeneration = useCallback(
    async (templateId: string) => {
      if (!state.preview) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null, step: 'processing' }));
      try {
        const res = await startBatchGeneration({ templateId, data: state.preview.rows });
        const job = res.data!;
        setState((prev) => ({ ...prev, job, isLoading: false }));
        pollJobStatus(job._id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          step: 'error',
          error: err instanceof Error ? err.message : 'Failed to start batch generation.',
        }));
      }
    },
    [state.preview, pollJobStatus]
  );

  const reset = useCallback(() => {
    stopPolling();
    setState({ step: 'idle', preview: null, job: null, error: null, isLoading: false });
  }, [stopPolling]);

  return {
    ...state,
    parseLocalFile,
    uploadFile,
    startGeneration,
    reset,
  };
};
