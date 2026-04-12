import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import type { OrganizationRole } from './User';

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type InvitationRole = Extract<OrganizationRole, 'admin' | 'member'>;

export interface ITeamInvitation {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: InvitationRole;
  token: string;
  status: InvitationStatus;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamInvitationDocument extends ITeamInvitation, Document {}

const TeamInvitationSchema = new Schema<ITeamInvitationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(24),
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  },
  { timestamps: true }
);

TeamInvitationSchema.index({ organizationId: 1, email: 1, status: 1 });

export const TeamInvitation = mongoose.model<ITeamInvitationDocument>(
  'TeamInvitation',
  TeamInvitationSchema
);
