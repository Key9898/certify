import { del, get, patch, post } from './api';
import type {
  ApiResponse,
  CreateIntegrationDto,
  Integration,
  IntegrationCatalogItem,
  IntegrationTestResult,
  UpdateIntegrationDto,
} from '@/types';

export const fetchIntegrationCatalog = async (): Promise<
  ApiResponse<IntegrationCatalogItem[]>
> => get<IntegrationCatalogItem[]>('/integrations/catalog');

export const fetchIntegrations = async (): Promise<
  ApiResponse<Integration[]>
> => get<Integration[]>('/integrations');

export const createIntegration = async (
  body: CreateIntegrationDto
): Promise<
  ApiResponse<Integration & { samplePayload: Record<string, unknown> }>
> =>
  post<Integration & { samplePayload: Record<string, unknown> }>(
    '/integrations',
    body
  );

export const updateIntegration = async (
  id: string,
  body: UpdateIntegrationDto
): Promise<
  ApiResponse<Integration & { samplePayload: Record<string, unknown> }>
> =>
  patch<Integration & { samplePayload: Record<string, unknown> }>(
    `/integrations/${id}`,
    body
  );

export const deleteIntegration = async (
  id: string
): Promise<ApiResponse<{ message: string }>> =>
  del<{ message: string }>(`/integrations/${id}`);

export const testIntegration = async (
  id: string
): Promise<ApiResponse<IntegrationTestResult>> =>
  post<IntegrationTestResult>(`/integrations/${id}/test`, {});
