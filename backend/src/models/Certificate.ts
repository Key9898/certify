import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICertificate {
  templateId: mongoose.Types.ObjectId;
  recipientName: string;
  recipientEmail?: string;
  certificateTitle: string;
  description?: string;
  issueDate: Date;
  expiryDate?: Date;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  customFields?: Record<string, unknown>;
  pdfUrl?: string;
  certificateId: string;
  status: 'active' | 'revoked';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificateDocument extends ICertificate, Document {}

const CertificateSchema = new Schema<ICertificateDocument>(
  {
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    recipientName: { type: String, required: true, trim: true },
    recipientEmail: { type: String, lowercase: true, trim: true },
    certificateTitle: { type: String, required: true, trim: true },
    description: { type: String },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    issuerName: { type: String, required: true, trim: true },
    issuerSignature: { type: String },
    organizationLogo: { type: String },
    customFields: { type: Schema.Types.Mixed },
    pdfUrl: { type: String },
    certificateId: {
      type: String,
      unique: true,
      default: () => nanoid(12).toUpperCase(),
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

CertificateSchema.index({ createdBy: 1, createdAt: -1 });
CertificateSchema.index({ recipientName: 'text', certificateTitle: 'text' });

export const Certificate = mongoose.model<ICertificateDocument>('Certificate', CertificateSchema);
