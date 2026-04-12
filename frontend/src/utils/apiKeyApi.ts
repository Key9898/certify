import { get, post, del } from './api';
import type { ApiResponse } from '@/types/api';

export interface ApiKeyListItem {
  _id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

export interface CreatedApiKey {
  _id: string;
  name: string;
  key: string;
  createdAt: string;
}

export const listApiKeys = (): Promise<ApiResponse<ApiKeyListItem[]>> =>
  get<ApiKeyListItem[]>('/keys');

export const createApiKey = (
  name: string
): Promise<ApiResponse<CreatedApiKey>> =>
  post<CreatedApiKey>('/keys', { name });

export const revokeApiKey = (id: string): Promise<ApiResponse<void>> =>
  del<void>(`/keys/${id}`);
