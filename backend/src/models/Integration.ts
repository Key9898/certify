import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export type IntegrationProvider = 'google_sheets' | 'canvas' | 'custom';

export type IntegrationMode = 'single' | 'batch';
export type IntegrationStatus = 'active' | 'paused';

export interface IIntegrationDefaults {
  certificateTitle?: string;
  description?: string;
  issuerName?: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type CanvasCompletionPreset =
  | 'course_completion'
  | 'module_completion'
  | 'capstone_completion';

export type CanvasReturnMode = 'response_only' | 'submission_comment';

export interface IGoogleSheetsSettings {
  enabled?: boolean;
  spreadsheetId?: string;
  sheetName?: string;
  statusColumn?: string;
  certificateIdColumn?: string;
  pdfUrlColumn?: string;
  batchJobIdColumn?: string;
  processedAtColumn?: string;
}

export interface ICanvasSettings {
  enabled?: boolean;
  baseUrl?: string;
  courseId?: string;
  assignmentId?: string;
  moduleId?: string;
  completionPreset?: CanvasCompletionPreset;
  returnMode?: CanvasReturnMode;
}

export interface IIntegrationSettings {
  autoGeneratePdf: boolean;
  googleSheets?: IGoogleSheetsSettings;
  canvas?: ICanvasSettings;
}

export interface IIntegrationStats {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  lastTriggeredAt?: Date;
  lastSuccessfulRunAt?: Date;
  lastTestedAt?: Date;
  lastError?: string;
}

export interface IIntegration {
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  name: string;
  provider: IntegrationProvider;
  description?: string;
  status: IntegrationStatus;
  mode: IntegrationMode;
  templateId: mongoose.Types.ObjectId;
  webhookKey: string;
  defaults: IIntegrationDefaults;
  settings: IIntegrationSettings;
  stats: IIntegrationStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIntegrationDocument extends IIntegration, Document {}

const IntegrationDefaultsSchema = new Schema<IIntegrationDefaults>(
  {
    certificateTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    issuerName: { type: String, trim: true },
    issuerSignature: { type: String, trim: true },
    organizationLogo: { type: String, trim: true },
    primaryColor: { type: String, trim: true },
    secondaryColor: { type: String, trim: true },
  },
  { _id: false }
);

const IntegrationSettingsSchema = new Schema<IIntegrationSettings>(
  {
    autoGeneratePdf: { type: Boolean, default: true },
    googleSheets: {
      enabled: { type: Boolean, default: false },
      spreadsheetId: { type: String, trim: true },
      sheetName: { type: String, trim: true },
      statusColumn: { type: String, trim: true },
      certificateIdColumn: { type: String, trim: true },
      pdfUrlColumn: { type: String, trim: true },
      batchJobIdColumn: { type: String, trim: true },
      processedAtColumn: { type: String, trim: true },
    },
    canvas: {
      enabled: { type: Boolean, default: false },
      baseUrl: { type: String, trim: true },
      courseId: { type: String, trim: true },
      assignmentId: { type: String, trim: true },
      moduleId: { type: String, trim: true },
      completionPreset: {
        type: String,
        enum: ['course_completion', 'module_completion', 'capstone_completion'],
        default: 'course_completion',
      },
      returnMode: {
        type: String,
        enum: ['response_only', 'submission_comment'],
        default: 'response_only',
      },
    },
  },
  { _id: false }
);

const IntegrationStatsSchema = new Schema<IIntegrationStats>(
  {
    totalRuns: { type: Number, default: 0 },
    successRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    lastTriggeredAt: { type: Date },
    lastSuccessfulRunAt: { type: Date },
    lastTestedAt: { type: Date },
    lastError: { type: String, trim: true },
  },
  { _id: false }
);

const IntegrationSchema = new Schema<IIntegrationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ['google_sheets', 'canvas', 'custom'],
      required: true,
    },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active',
    },
    mode: {
      type: String,
      enum: ['single', 'batch'],
      default: 'single',
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    webhookKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `ig_${nanoid(32)}`,
    },
    defaults: { type: IntegrationDefaultsSchema, default: () => ({}) },
    settings: { type: IntegrationSettingsSchema, default: () => ({}) },
    stats: { type: IntegrationStatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

IntegrationSchema.index({ organizationId: 1, provider: 1 });
IntegrationSchema.index({ organizationId: 1, createdAt: -1 });

export const Integration = mongoose.model<IIntegrationDocument>(
  'Integration',
  IntegrationSchema
);
