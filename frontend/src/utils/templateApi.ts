import { get } from './api';
import type { ApiResponse, Template } from '@/types';

export const fetchTemplates = async (): Promise<ApiResponse<Template[]>> => {
  return get<Template[]>('/templates');
};

export const fetchTemplate = async (id: string): Promise<ApiResponse<Template>> => {
  return get<Template>(`/templates/${id}`);
};
