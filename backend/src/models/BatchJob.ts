import mongoose, { Document, Schema } from 'mongoose';
import type { IntegrationProvider } from './Integration';

export interface IBatchResult {
  recipientName: string;
  status: 'success' | 'failed';
  certificateId?: mongoose.Types.ObjectId;
  publicCertificateId?: string;
  pdfUrl?: string;
  error?: string;
}

export interface IGoogleSheetsBatchSyncContext {
  spreadsheetId: string;
  sheetName: string;
  statusColumn?: string;
  certificateIdColumn?: string;
  pdfUrlColumn?: string;
  batchJobIdColumn?: string;
  processedAtColumn?: string;
  rows: Array<{
    rowNumber: number;
    recipientName: string;
  }>;
}

export interface IBatchJobIntegrationContext {
  integrationId?: mongoose.Types.ObjectId;
  provider?: IntegrationProvider;
  googleSheets?: IGoogleSheetsBatchSyncContext;
}

export interface IBatchJob {
  templateId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCertificates: number;
  processedCertificates: number;
  data: Record<string, string>[];
  results: IBatchResult[];
  errorMessage?: string;
  createdBy: mongoose.Types.ObjectId;
  integrationContext?: IBatchJobIntegrationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBatchJobDocument extends IBatchJob, Document {}

const BatchResultSchema = new Schema<IBatchResult>(
  {
    recipientName: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
    publicCertificateId: { type: String },
    pdfUrl: { type: String },
    error: { type: String },
  },
  { _id: false }
);

const BatchJobSchema = new Schema<IBatchJobDocument>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    totalCertificates: { type: Number, required: true, default: 0 },
    processedCertificates: { type: Number, default: 0 },
    data: [{ type: Schema.Types.Mixed }],
    results: [BatchResultSchema],
    errorMessage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    integrationContext: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

BatchJobSchema.index({ createdBy: 1, createdAt: -1 });
BatchJobSchema.index({ status: 1 });

export const BatchJob = mongoose.model<IBatchJobDocument>(
  'BatchJob',
  BatchJobSchema
);
