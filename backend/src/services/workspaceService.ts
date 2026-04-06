import mongoose from 'mongoose';
import { Organization, type IOrganizationDocument } from '../models/Organization';
import { TeamInvitation } from '../models/TeamInvitation';
import { User, type IUserDocument, type OrganizationRole } from '../models/User';

const DEFAULT_PRIMARY_COLOR = '#3B82F6';
const DEFAULT_SECONDARY_COLOR = '#64748B';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'workspace';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (await Organization.exists({ slug })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

export const createWorkspaceForUser = async (
  user: IUserDocument,
  name?: string
): Promise<IUserDocument> => {
  const organization = await Organization.create({
    name: name?.trim() || `${user.name}'s Workspace`,
    slug: await createUniqueSlug(name?.trim() || `${user.name}'s Workspace`),
    owner: user._id,
    whiteLabel: {
      brandName: name?.trim() || user.name,
      primaryColor: user.settings.defaultColors.primary || DEFAULT_PRIMARY_COLOR,
      secondaryColor: user.settings.defaultColors.secondary || DEFAULT_SECONDARY_COLOR,
      hidePoweredBy: false,
    },
  });

  user.organizationId = organization._id as mongoose.Types.ObjectId;
  user.organizationRole = 'owner';
  await user.save();
  return user;
};

const assignInvitationToUser = async (
  user: IUserDocument
): Promise<IUserDocument | null> => {
  const now = new Date();
  const invitation = await TeamInvitation.findOne({
    email: normalizeEmail(user.email),
    status: 'pending',
    expiresAt: { $gt: now },
  }).sort({ createdAt: 1 });

  if (!invitation) {
    await TeamInvitation.updateMany(
      {
        email: normalizeEmail(user.email),
        status: 'pending',
        expiresAt: { $lte: now },
      },
      { $set: { status: 'expired' } }
    );
    return null;
  }

  user.organizationId = invitation.organizationId;
  user.organizationRole = invitation.role;
  await user.save();

  invitation.status = 'accepted';
  await invitation.save();

  return user;
};

export const ensureUserWorkspace = async (user: IUserDocument): Promise<IUserDocument> => {
  if (user.organizationId) {
    return user;
  }

  const invitedUser = await assignInvitationToUser(user);
  if (invitedUser) {
    return invitedUser;
  }

  return createWorkspaceForUser(user);
};

export const isWorkspaceAdmin = (user: IUserDocument): boolean =>
  user.organizationRole === 'owner' || user.organizationRole === 'admin';

export const getWorkspaceMemberIds = async (
  user: Pick<IUserDocument, '_id' | 'organizationId'>
): Promise<mongoose.Types.ObjectId[]> => {
  if (!user.organizationId) {
    return [new mongoose.Types.ObjectId(user._id.toString())];
  }

  const members = await User.find({ organizationId: user.organizationId }).select('_id').lean();
  return members.map((member) => new mongoose.Types.ObjectId(member._id.toString()));
};

export const getWorkspaceMemberIdsForUserId = async (
  userId: string
): Promise<mongoose.Types.ObjectId[]> => {
  const user = await User.findById(userId).select('_id organizationId');
  if (!user) {
    return [new mongoose.Types.ObjectId(userId)];
  }

  return getWorkspaceMemberIds(user);
};

export const canManageWorkspaceResource = async (
  currentUser: IUserDocument,
  ownerId: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  const ownerIdString = ownerId.toString();

  if (currentUser._id.toString() === ownerIdString) {
    return true;
  }

  if (!isWorkspaceAdmin(currentUser) || !currentUser.organizationId) {
    return false;
  }

  const owner = await User.findOne({
    _id: ownerIdString,
    organizationId: currentUser.organizationId,
  }).select('_id');

  return Boolean(owner);
};

const serializeOrganization = (organization: IOrganizationDocument | null) => {
  if (!organization) return null;

  return {
    _id: organization._id.toString(),
    name: organization.name,
    slug: organization.slug,
    owner: organization.owner.toString(),
    whiteLabel: {
      brandName: organization.whiteLabel.brandName,
      logoUrl: organization.whiteLabel.logoUrl,
      primaryColor: organization.whiteLabel.primaryColor || DEFAULT_PRIMARY_COLOR,
      secondaryColor: organization.whiteLabel.secondaryColor || DEFAULT_SECONDARY_COLOR,
      supportEmail: organization.whiteLabel.supportEmail,
      customDomain: organization.whiteLabel.customDomain,
      hidePoweredBy: organization.whiteLabel.hidePoweredBy ?? false,
    },
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
};

export const buildAppUser = async (userOrId: IUserDocument | string) => {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId._id.toString();

  const user = await User.findById(userId).populate('organizationId');
  if (!user) {
    return null;
  }

  const organization =
    user.organizationId && typeof user.organizationId === 'object' && 'name' in user.organizationId
      ? (user.organizationId as unknown as IOrganizationDocument)
      : null;

  const plainUser = user.toObject();

  return {
    ...plainUser,
    organizationId: organization?._id?.toString() || plainUser.organizationId?.toString(),
    organizationRole: plainUser.organizationRole as OrganizationRole | undefined,
    organization: serializeOrganization(organization),
  };
};

export const getWorkspaceMembers = async (user: IUserDocument) => {
  if (!user.organizationId) {
    return [user];
  }

  return User.find({ organizationId: user.organizationId }).sort({ createdAt: 1 });
};

export const normalizeWorkspaceEmail = normalizeEmail;
