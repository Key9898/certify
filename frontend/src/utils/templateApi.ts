import { get, post, put, del } from './api';
import type { ApiResponse, Template } from '@/types';

export const fetchTemplates = async (): Promise<ApiResponse<Template[]>> => {
  return get<Template[]>('/templates');
};

export const fetchTemplate = async (
  id: string
): Promise<ApiResponse<Template>> => {
  return get<Template>(`/templates/${id}`);
};

export const createTemplate = async (
  data: Partial<Template>
): Promise<ApiResponse<Template>> => {
  return post<Template>('/templates', data);
};

export const updateTemplate = async (
  id: string,
  data: Partial<Template>
): Promise<ApiResponse<Template>> => {
  return put<Template>(`/templates/${id}`, data);
};

export const deleteTemplate = async (
  id: string
): Promise<ApiResponse<void>> => {
  return del<void>(`/templates/${id}`);
};
