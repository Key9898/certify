import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IApiKey {
  key: string;
  name: string;
  createdBy: mongoose.Types.ObjectId;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiKeyDocument extends IApiKey, Document {}

const ApiKeySchema = new Schema<IApiKeyDocument>(
  {
    key: {
      type: String,
      unique: true,
      index: true,
      default: () => `ck_${nanoid(32)}`,
    },
    name: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastUsedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ApiKeySchema.index({ createdBy: 1 });

export const ApiKey = mongoose.model<IApiKeyDocument>('ApiKey', ApiKeySchema);
