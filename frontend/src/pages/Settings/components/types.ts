import type { TeamWorkspace } from '@/types';
import type { ApiKeyListItem } from '@/utils/apiKeyApi';
import type { Webhook as WebhookType, WebhookEvent } from '@/utils/webhookApi';

export type SettingsTab =
  | 'general'
  | 'workspace'
  | 'branding'
  | 'developer'
  | 'security';

export interface GeneralTabProps {
  displayName: string;
  userEmail?: string;
  userPicture?: string;
  appRole: string;
  orgRole?: string;
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  handleSaveColors: () => Promise<void>;
  isSavingColors: boolean;
  saved: boolean;
  saveError: string | null;
}

export interface WorkspaceTabProps {
  teamData: TeamWorkspace | null;
  teamLoading: boolean;
  teamError: string | null;
  canManageWorkspace: boolean;
  teamActionId: string | null;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: 'admin' | 'member';
  setInviteRole: (role: 'admin' | 'member') => void;
  handleInviteMember: () => Promise<void>;
  handleUpdateMemberRole: (
    userId: string,
    role: 'admin' | 'member'
  ) => Promise<void>;
  handleRemoveMember: (userId: string) => Promise<void>;
  handleCancelInvitation: (invitationId: string) => Promise<void>;
}

export interface BrandingTabProps {
  canManageWorkspace: boolean;
  organizationName: string;
  setOrganizationName: (name: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  brandLogoUrl: string;
  handleUploadBrandLogo: (file: File) => Promise<void>;
  isUploading: boolean;
  brandPrimaryColor: string;
  setBrandPrimaryColor: (color: string) => void;
  brandSecondaryColor: string;
  setBrandSecondaryColor: (color: string) => void;
  supportEmail: string;
  setSupportEmail: (email: string) => void;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
  hidePoweredBy: boolean;
  setHidePoweredBy: (hide: boolean) => void;
  handleSaveWhiteLabel: () => Promise<void>;
  isSavingWhiteLabel: boolean;
  whiteLabelSaved: boolean;
  whiteLabelError: string | null;
}

export interface DeveloperTabProps {
  apiKeys: ApiKeyListItem[];
  newKeyName: string;
  setNewKeyName: (name: string) => void;
  handleCreateKey: () => Promise<void>;
  handleRevokeKey: (id: string) => Promise<void>;
  createdKey: string | null;
  setCreatedKey: (key: string | null) => void;
  handleCopyKey: () => void;
  keyCopied: boolean;
  keyLoading: boolean;
  keyError: string | null;
  webhooks: WebhookType[];
  newWebhookUrl: string;
  setNewWebhookUrl: (url: string) => void;
  newWebhookEvents: WebhookEvent[];
  toggleEvent: (event: WebhookEvent) => void;
  handleCreateWebhook: () => Promise<void>;
  handleDeleteWebhook: (id: string) => Promise<void>;
  webhookLoading: boolean;
  webhookError: string | null;
  createdSecret: string | null;
  setCreatedSecret: (secret: string | null) => void;
  handleCopySecret: () => void;
  secretCopied: boolean;
}

export interface SecurityTabProps {
  isEmailPasswordUser: boolean;
  userEmail?: string;
  pwResetStatus: 'sent' | 'error' | null;
  pwResetLoading: boolean;
  handlePasswordReset: () => Promise<void>;
  handleLogout: () => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (text: string) => void;
  deleteLoading: boolean;
  deleteError: string | null;
  handleDeleteAccount: () => Promise<void>;
  setDeleteError: (error: string | null) => void;
  pwChangeLoading: boolean;
  pwChangeError: string | null;
  pwChangeSuccess: boolean;
  handleChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}
