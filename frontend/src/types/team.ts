import type { Organization, OrganizationRole } from './user';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: OrganizationRole;
  joinedAt: string;
  isCurrentUser: boolean;
}

export interface TeamInvitation {
  _id: string;
  email: string;
  role: Exclude<OrganizationRole, 'owner'>;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    _id: string;
    name: string;
    email?: string;
  };
}

export interface TeamWorkspace {
  organization: Organization | null;
  members: TeamMember[];
  invitations: TeamInvitation[];
  permissions: {
    canManageTeam: boolean;
    canManageWhiteLabel: boolean;
  };
}
