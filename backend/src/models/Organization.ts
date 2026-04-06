import mongoose, { Document, Schema } from 'mongoose';

export interface IWhiteLabelSettings {
  brandName?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail?: string;
  customDomain?: string;
  hidePoweredBy: boolean;
}

export interface IOrganization {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  whiteLabel: IWhiteLabelSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationDocument extends IOrganization, Document {}

const WhiteLabelSchema = new Schema<IWhiteLabelSettings>(
  {
    brandName: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#64748B' },
    supportEmail: { type: String, trim: true, lowercase: true },
    customDomain: { type: String, trim: true, lowercase: true },
    hidePoweredBy: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    whiteLabel: { type: WhiteLabelSchema, default: () => ({}) },
  },
  { timestamps: true }
);

OrganizationSchema.index({ owner: 1 });

export const Organization = mongoose.model<IOrganizationDocument>(
  'Organization',
  OrganizationSchema
);
