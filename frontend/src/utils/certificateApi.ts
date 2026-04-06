import { del, fetchWithAuth, get, post } from './api';
import type { ApiResponse, PaginatedResponse, Certificate, CreateCertificateDto } from '@/types';

export const fetchCertificates = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Certificate>> => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const qs = query.toString() ? `?${query.toString()}` : '';
  return (await get<Certificate[]>(`/certificates${qs}`)) as unknown as PaginatedResponse<Certificate>;
};

export const fetchCertificate = async (id: string): Promise<ApiResponse<Certificate>> => {
  return get<Certificate>(`/certificates/${id}`);
};

export const createCertificate = async (
  data: CreateCertificateDto
): Promise<ApiResponse<Certificate>> => {
  return post<Certificate>('/certificates', data);
};

export const generatePdf = async (id: string): Promise<ApiResponse<{ pdfUrl: string }>> => {
  return post<{ pdfUrl: string }>(`/certificates/generate-pdf/${id}`, {});
};

export const downloadPng = async (id: string, certificateId: string): Promise<void> => {
  const response = await fetchWithAuth(`/certificates/generate-png/${id}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('PNG generation failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${certificateId}.png`;
  a.click();
  URL.revokeObjectURL(url);
};

export const deleteCertificate = async (id: string): Promise<ApiResponse<unknown>> => {
  return del(`/certificates/${id}`);
};
