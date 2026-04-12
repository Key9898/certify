import mongoose, { Document, Schema } from 'mongoose';

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface IUser {
  auth0Id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  organizationId?: mongoose.Types.ObjectId;
  organizationRole?: OrganizationRole;
  settings: {
    defaultLogo?: string;
    defaultColors: {
      primary: string;
      secondary: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    organizationRole: { type: String, enum: ['owner', 'admin', 'member'] },
    settings: {
      defaultLogo: { type: String },
      defaultColors: {
        primary: { type: String, default: '#3B82F6' },
        secondary: { type: String, default: '#64748B' },
      },
    },
  },
  { timestamps: true }
);

UserSchema.index({ organizationId: 1, organizationRole: 1 });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
