import { apiRequest, fetchWithAuth, post } from './api';
import type { ApiResponse } from '@/types/api';
import type {
  BatchJob,
  BatchUploadPreview,
  StartBatchDto,
} from '@/types/batch';

export const uploadBatchCsv = async (
  file: File
): Promise<ApiResponse<BatchUploadPreview>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithAuth('/batch/upload', {
    method: 'POST',
    body: formData,
  });

  const data: ApiResponse<BatchUploadPreview> = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `HTTP error! status: ${response.status}`
    );
  }

  return data;
};

export const startBatchGeneration = async (
  dto: StartBatchDto
): Promise<ApiResponse<BatchJob>> => {
  return post<BatchJob>('/batch/generate', dto);
};

export const fetchBatchStatus = async (
  jobId: string
): Promise<ApiResponse<BatchJob>> => {
  return apiRequest<BatchJob>(`/batch/${jobId}/status`);
};

export const downloadBatchZip = async (jobId: string): Promise<void> => {
  const response = await fetchWithAuth(`/batch/${jobId}/download-zip`);
  if (!response.ok) {
    throw new Error(`Failed to download ZIP: ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `batch-${jobId}-certificates.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
