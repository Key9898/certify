import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IApiKey {
  key: string;
  name: string;
  createdBy: mongoose.Types.ObjectId;
  lastUsedAt?: Date;
  isActive: boolean;
  expiresAt?: Date;
  rateLimit?: number;
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
    expiresAt: { type: Date },
    rateLimit: { type: Number, min: 1, max: 1000, default: 100 },
  },
  { timestamps: true }
);

ApiKeySchema.index({ createdBy: 1 });
ApiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ApiKey = mongoose.model<IApiKeyDocument>('ApiKey', ApiKeySchema);
