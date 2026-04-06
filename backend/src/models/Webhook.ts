import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export type WebhookEvent =
  | 'certificate.created'
  | 'certificate.pdf_generated'
  | 'batch.completed'
  | 'batch.failed';

export interface IWebhook {
  url: string;
  secret: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebhookDocument extends IWebhook, Document {}

const WebhookSchema = new Schema<IWebhookDocument>(
  {
    url: { type: String, required: true, trim: true },
    secret: { type: String, default: () => nanoid(32) },
    events: {
      type: [String],
      enum: ['certificate.created', 'certificate.pdf_generated', 'batch.completed', 'batch.failed'],
      default: ['certificate.created'],
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

WebhookSchema.index({ createdBy: 1 });

export const Webhook = mongoose.model<IWebhookDocument>('Webhook', WebhookSchema);
