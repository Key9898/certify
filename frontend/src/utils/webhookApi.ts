import { get, post, del } from './api';
import type { ApiResponse } from '@/types/api';

export type WebhookEvent =
  | 'certificate.created'
  | 'certificate.pdf_generated'
  | 'batch.completed'
  | 'batch.failed';

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  'certificate.created',
  'certificate.pdf_generated',
  'batch.completed',
  'batch.failed',
];

export interface Webhook {
  _id: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: string;
}

export interface CreatedWebhook extends Webhook {
  secret: string;
}

export const listWebhooks = (): Promise<ApiResponse<Webhook[]>> =>
  get<Webhook[]>('/webhooks');

export const createWebhook = (
  url: string,
  events: WebhookEvent[]
): Promise<ApiResponse<CreatedWebhook>> =>
  post<CreatedWebhook>('/webhooks', { url, events });

export const deleteWebhook = (id: string): Promise<ApiResponse<void>> =>
  del<void>(`/webhooks/${id}`);
