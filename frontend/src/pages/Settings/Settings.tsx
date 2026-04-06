import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  LogOut,
  Shield,
  Key,
  Webhook,
  Trash2,
  Plus,
  Copy,
  Check,
  Globe,
  Users,
  Building2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FileUpload } from '@/components/common/FileUpload';
import { useAppUser } from '@/context/AuthContext';
import { useCloudinary } from '@/hooks/useCloudinary';
import { patch } from '@/utils/api';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from '@/utils/constants';
import { SOFT_SPRING } from '@/utils/motion';
import { listApiKeys, createApiKey, revokeApiKey } from '@/utils/apiKeyApi';
import { listWebhooks, createWebhook, deleteWebhook, ALL_WEBHOOK_EVENTS } from '@/utils/webhookApi';
import {
  fetchTeamWorkspace,
  inviteTeamMember,
  updateTeamMemberRole as updateWorkspaceRole,
  removeTeamMember as removeWorkspaceMember,
  cancelTeamInvitation as cancelWorkspaceInvitation,
} from '@/utils/teamApi';
import type { ApiKeyListItem } from '@/utils/apiKeyApi';
import type { Webhook as WebhookType, WebhookEvent } from '@/utils/webhookApi';
import type { TeamWorkspace, User as AppUser } from '@/types';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth0();
  const { appUser, setAppUser } = useAppUser();
  const { upload, isUploading } = useCloudinary();

  const [primaryColor, setPrimaryColor] = useState(
    appUser?.settings?.defaultColors?.primary || DEFAULT_PRIMARY_COLOR
  );
  const [secondaryColor, setSecondaryColor] = useState(
    appUser?.settings?.defaultColors?.secondary || DEFAULT_SECONDARY_COLOR
  );
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingColors, setIsSavingColors] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<WebhookEvent[]>([...ALL_WEBHOOK_EVENTS]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [teamData, setTeamData] = useState<TeamWorkspace | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamActionId, setTeamActionId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [organizationName, setOrganizationName] = useState(appUser?.organization?.name || '');
  const [brandName, setBrandName] = useState(appUser?.organization?.whiteLabel.brandName || '');
  const [brandLogoUrl, setBrandLogoUrl] = useState(
    appUser?.organization?.whiteLabel.logoUrl || ''
  );
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(
    appUser?.organization?.whiteLabel.primaryColor || DEFAULT_PRIMARY_COLOR
  );
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(
    appUser?.organization?.whiteLabel.secondaryColor || DEFAULT_SECONDARY_COLOR
  );
  const [supportEmail, setSupportEmail] = useState(
    appUser?.organization?.whiteLabel.supportEmail || ''
  );
  const [customDomain, setCustomDomain] = useState(
    appUser?.organization?.whiteLabel.customDomain || ''
  );
  const [hidePoweredBy, setHidePoweredBy] = useState(
    appUser?.organization?.whiteLabel.hidePoweredBy || false
  );
  const [whiteLabelSaved, setWhiteLabelSaved] = useState(false);
  const [whiteLabelError, setWhiteLabelError] = useState<string | null>(null);
  const [isSavingWhiteLabel, setIsSavingWhiteLabel] = useState(false);
  const canManageWorkspace =
    appUser?.organizationRole === 'owner' || appUser?.organizationRole === 'admin';
  const workspaceName =
    teamData?.organization?.name || appUser?.organization?.name || 'Personal Workspace';
  const workspaceRoleLabel = appUser?.organizationRole || 'member';

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await listApiKeys();
      setApiKeys(res.data ?? []);
    } catch {
      // non-critical — page still loads
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await listWebhooks();
      setWebhooks(res.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const loadTeamWorkspace = useCallback(async () => {
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await fetchTeamWorkspace();
      setTeamData(res.data ?? null);
    } catch (err) {
      setTeamData(null);
      setTeamError(err instanceof Error ? err.message : 'Failed to load workspace.');
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
    loadTeamWorkspace();
  }, [fetchApiKeys, fetchWebhooks, loadTeamWorkspace]);

  useEffect(() => {
    if (!appUser) return;

    setPrimaryColor(appUser.settings.defaultColors.primary || DEFAULT_PRIMARY_COLOR);
    setSecondaryColor(appUser.settings.defaultColors.secondary || DEFAULT_SECONDARY_COLOR);
    setOrganizationName(appUser.organization?.name || '');
    setBrandName(appUser.organization?.whiteLabel.brandName || '');
    setBrandLogoUrl(appUser.organization?.whiteLabel.logoUrl || '');
    setBrandPrimaryColor(
      appUser.organization?.whiteLabel.primaryColor || DEFAULT_PRIMARY_COLOR
    );
    setBrandSecondaryColor(
      appUser.organization?.whiteLabel.secondaryColor || DEFAULT_SECONDARY_COLOR
    );
    setSupportEmail(appUser.organization?.whiteLabel.supportEmail || '');
    setCustomDomain(appUser.organization?.whiteLabel.customDomain || '');
    setHidePoweredBy(appUser.organization?.whiteLabel.hidePoweredBy || false);
  }, [appUser]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setKeyLoading(true);
    setKeyError(null);
    try {
      const res = await createApiKey(newKeyName.trim());
      if (res.data) {
        setCreatedKey(res.data.key);
        setNewKeyName('');
        await fetchApiKeys();
      }
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeApiKey(id);
      await fetchApiKeys();
    } catch {
      // ignore
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim() || newWebhookEvents.length === 0) return;
    setWebhookLoading(true);
    setWebhookError(null);
    try {
      const res = await createWebhook(newWebhookUrl.trim(), newWebhookEvents);
      if (res.data) {
        setCreatedSecret(res.data.secret ?? null);
        setNewWebhookUrl('');
        setNewWebhookEvents([...ALL_WEBHOOK_EVENTS]);
        await fetchWebhooks();
      }
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : 'Failed to create webhook');
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await deleteWebhook(id);
      await fetchWebhooks();
    } catch {
      // ignore
    }
  };

  const handleCopySecret = () => {
    if (createdSecret) {
      navigator.clipboard.writeText(createdSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const toggleEvent = (event: WebhookEvent) => {
    setNewWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleSaveColors = async () => {
    setIsSavingColors(true);
    setSaveError(null);
    try {
      const res = await patch<AppUser>('/users/settings', {
        defaultColors: {
          primary: primaryColor,
          secondary: secondaryColor,
        },
      });

      if (res.data) {
        setAppUser(res.data);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setIsSavingColors(false);
    }
  };

  const handleUploadBrandLogo = async (file: File) => {
    const result = await upload(file, 'logos');
    if (result) {
      setBrandLogoUrl(result.secure_url);
    }
  };

  const handleSaveWhiteLabel = async () => {
    setIsSavingWhiteLabel(true);
    setWhiteLabelError(null);
    try {
      const res = await patch<AppUser>('/users/settings', {
        organizationName,
        whiteLabel: {
          brandName,
          logoUrl: brandLogoUrl,
          primaryColor: brandPrimaryColor,
          secondaryColor: brandSecondaryColor,
          supportEmail,
          customDomain,
          hidePoweredBy,
        },
      });

      if (res.data) {
        setAppUser(res.data);
      }

      await loadTeamWorkspace();
      setWhiteLabelSaved(true);
      setTimeout(() => setWhiteLabelSaved(false), 2500);
    } catch (err) {
      setWhiteLabelError(err instanceof Error ? err.message : 'Failed to save white label.');
    } finally {
      setIsSavingWhiteLabel(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setTeamActionId('invite');
    setTeamError(null);
    try {
      await inviteTeamMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('member');
      await loadTeamWorkspace();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to invite teammate.');
    } finally {
      setTeamActionId(null);
    }
  };

  const handleUpdateMemberRole = async (
    userId: string,
    role: 'admin' | 'member'
  ) => {
    setTeamActionId(userId);
    setTeamError(null);
    try {
      await updateWorkspaceRole(userId, role);
      await loadTeamWorkspace();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to update member role.');
    } finally {
      setTeamActionId(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setTeamActionId(userId);
    setTeamError(null);
    try {
      await removeWorkspaceMember(userId);
      await loadTeamWorkspace();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to remove member.');
    } finally {
      setTeamActionId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setTeamActionId(invitationId);
    setTeamError(null);
    try {
      await cancelWorkspaceInvitation(invitationId);
      await loadTeamWorkspace();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to cancel invitation.');
    } finally {
      setTeamActionId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rounded border border-base-200 bg-base-100 p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  <Shield size={14} />
                  Workspace Control Center
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-base-content">
                  Settings
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-base-content/60">
                  Manage account access, team roles, branding, API credentials, and outbound
                  automation from one place.
                </p>
              </div>

              <div className="rounded border border-base-200 bg-base-200/35 px-4 py-4 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-base-content/35">
                  Active Workspace
                </p>
                <p className="mt-2 text-xl font-black tracking-tight text-base-content">
                  {workspaceName}
                </p>
                <p className="mt-1 text-sm capitalize text-base-content/55">
                  {workspaceRoleLabel} access
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Team Members',
                  value: String(teamData?.members.length ?? 0),
                  detail: 'active workspace seats',
                },
                {
                  label: 'Pending Invites',
                  value: String(teamData?.invitations.length ?? 0),
                  detail: 'awaiting acceptance',
                },
                {
                  label: 'API Keys',
                  value: String(apiKeys.length),
                  detail: 'external access tokens',
                },
                {
                  label: 'Webhooks',
                  value: String(webhooks.length),
                  detail: 'delivery endpoints saved',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SOFT_SPRING, delay: 0.06 + index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="rounded border border-base-200 bg-base-100/90 px-4 py-4 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-base-content/35">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-base-content">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-base-content/55">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-primary/10 rounded-lg p-2">
              <User size={18} className="text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-base-content">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User avatar'}
                className="w-16 h-16 rounded-full ring-2 ring-primary ring-offset-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-content">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="font-semibold text-base-content">{user?.name}</p>
              <p className="text-sm text-base-content/60">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="badge badge-ghost badge-sm capitalize">
                  {appUser?.role || 'user'}
                </span>
                {appUser?.organizationRole && (
                  <span className="badge badge-primary badge-sm capitalize">
                    {appUser.organizationRole}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="Full Name"
              value={user?.name || ''}
              readOnly
              hint="Managed by Auth0 — update via your account provider"
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              readOnly
              hint="Managed by Auth0 — update via your account provider"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-info/10 rounded-lg p-2">
              <Users size={18} className="text-info" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">Team Collaboration</h2>
              <p className="text-xs text-base-content/50">
                Invite teammates and collaborate inside a shared workspace.
              </p>
            </div>
          </div>

          {teamLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : (
            <>
              {teamData?.organization && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="rounded border border-base-200 bg-base-200/40 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-1">
                      Workspace
                    </p>
                    <p className="font-bold text-base-content">{teamData.organization.name}</p>
                  </div>
                  <div className="rounded border border-base-200 bg-base-200/40 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-1">
                      Slug
                    </p>
                    <p className="font-mono text-sm text-base-content">{teamData.organization.slug}</p>
                  </div>
                  <div className="rounded border border-base-200 bg-base-200/40 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-1">
                      Members
                    </p>
                    <p className="font-bold text-base-content">{teamData.members.length}</p>
                  </div>
                </div>
              )}

              {!canManageWorkspace && (
                <div className="alert alert-info mb-4">
                  <span className="text-sm">
                    Members can view workspace details. Only owners and admins can manage invites and roles.
                  </span>
                </div>
              )}

              {teamError && (
                <div className="alert alert-error mb-4">
                  <span className="text-sm">{teamError}</span>
                </div>
              )}

              <div className="space-y-3">
                {teamData?.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded border border-base-200 bg-base-200/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-base-content">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="text-xs font-medium text-base-content/40 ml-2">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-base-content/60">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-outline capitalize">{member.role}</span>
                      {canManageWorkspace && member.role !== 'owner' && !member.isCurrentUser && (
                        <>
                          <select
                            className="select select-bordered select-sm"
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateMemberRole(
                                member._id,
                                e.target.value as 'admin' | 'member'
                              )
                            }
                            disabled={teamActionId === member._id}
                            aria-label={`Change role for ${member.name}`}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={teamActionId === member._id}
                            aria-label={`Remove ${member.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {canManageWorkspace && (
                <div className="rounded border border-base-200 p-4 mt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-3">
                    Invite Teammate
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="teammate@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Role</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-control justify-end">
                      <label className="label invisible">
                        <span className="label-text">Invite</span>
                      </label>
                      <button
                        className="btn btn-primary"
                        onClick={handleInviteMember}
                        disabled={teamActionId === 'invite' || !inviteEmail.trim()}
                      >
                        {teamActionId === 'invite' ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <Plus size={14} />
                        )}
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {teamData && teamData.invitations.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-3">
                    Pending Invitations
                  </p>
                  <div className="space-y-3">
                    {teamData.invitations.map((invitation) => (
                      <div
                        key={invitation._id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded border border-base-200 bg-base-100 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-base-content">{invitation.email}</p>
                          <p className="text-xs text-base-content/50">
                            {invitation.role} invite - expires{' '}
                            {new Date(invitation.expiresAt).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-warning badge-sm capitalize">
                            {invitation.status}
                          </span>
                          {canManageWorkspace && (
                            <button
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => handleCancelInvitation(invitation._id)}
                              disabled={teamActionId === invitation._id}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-secondary/10 rounded-lg p-2">
              <Building2 size={18} className="text-secondary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">White Label Workspace</h2>
              <p className="text-xs text-base-content/50">
                Configure your verification brand, domain, and public-facing identity.
              </p>
            </div>
          </div>

          {!canManageWorkspace && (
            <div className="alert alert-info mb-4">
              <span className="text-sm">
                White-label settings are managed by workspace owners and admins.
              </span>
            </div>
          )}

          {whiteLabelSaved && (
            <div className="alert alert-success mb-4 py-2">
              <span className="text-sm">White-label settings saved!</span>
            </div>
          )}

          {whiteLabelError && (
            <div className="alert alert-error mb-4 py-2">
              <span className="text-sm">{whiteLabelError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Workspace Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Acme Academy"
              disabled={!canManageWorkspace}
            />
            <Input
              label="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Acme Certificates"
              disabled={!canManageWorkspace}
            />
            <Input
              label="Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@example.com"
              disabled={!canManageWorkspace}
            />
            <Input
              label="Custom Domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="certificates.example.com"
              hint="Stored for public verification and customer-facing links."
              disabled={!canManageWorkspace}
            />
          </div>

          <div className="mb-4">
            <FileUpload
              label="Brand Logo"
              accept="image/png,image/jpeg,image/svg+xml"
              onFileSelect={handleUploadBrandLogo}
              previewUrl={brandLogoUrl || undefined}
              hint="Upload a workspace logo for verification pages"
              isUploading={isUploading}
              disabled={!canManageWorkspace}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label" htmlFor="brand-primary">
                <span className="label-text font-medium">Brand Primary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="brand-primary"
                  type="color"
                  value={brandPrimaryColor}
                  onChange={(e) => setBrandPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-base-300"
                  disabled={!canManageWorkspace}
                />
                <p className="font-mono text-sm text-base-content">{brandPrimaryColor}</p>
              </div>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="brand-secondary">
                <span className="label-text font-medium">Brand Secondary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="brand-secondary"
                  type="color"
                  value={brandSecondaryColor}
                  onChange={(e) => setBrandSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-base-300"
                  disabled={!canManageWorkspace}
                />
                <p className="font-mono text-sm text-base-content">{brandSecondaryColor}</p>
              </div>
            </div>
          </div>

          <label className="mb-4 flex min-h-[44px] items-center gap-3 rounded px-1 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary h-5 w-5"
              checked={hidePoweredBy}
              onChange={(e) => setHidePoweredBy(e.target.checked)}
              disabled={!canManageWorkspace}
            />
            <span className="text-sm text-base-content">
              Hide "Powered by Certify" on public verification views
            </span>
          </label>

          <Button
            variant="primary"
            onClick={handleSaveWhiteLabel}
            isLoading={isSavingWhiteLabel}
            disabled={!canManageWorkspace}
          >
            Save White Label
          </Button>
        </motion.div>

        {/* Default Branding Colors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-accent/10 rounded-lg p-2">
              <Palette size={18} className="text-accent" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-base-content">Default Branding Colors</h2>
          </div>

          <p className="text-sm text-base-content/60 mb-4">
            These colors will be pre-filled when you create a new certificate.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="form-control">
              <label className="label" htmlFor="settings-primary">
                <span className="label-text font-medium">Primary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-primary"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-base-300"
                  aria-label="Primary color picker"
                />
                <div>
                  <p className="font-mono text-sm text-base-content">{primaryColor}</p>
                  <p className="text-xs text-base-content/50">Primary</p>
                </div>
              </div>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="settings-secondary">
                <span className="label-text font-medium">Secondary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-secondary"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-base-300"
                  aria-label="Secondary color picker"
                />
                <div>
                  <p className="font-mono text-sm text-base-content">{secondaryColor}</p>
                  <p className="text-xs text-base-content/50">Secondary</p>
                </div>
              </div>
            </div>
          </div>

          {saved && (
            <div className="alert alert-success mb-3 py-2">
              <span className="text-sm">Color preferences saved!</span>
            </div>
          )}

          {saveError && (
            <div className="alert alert-error mb-3 py-2">
              <span className="text-sm">{saveError}</span>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveColors}
            isLoading={isSavingColors}
          >
            Save Preferences
          </Button>
        </motion.div>

        {/* Security / Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-info/10 rounded-lg p-2">
              <Shield size={18} className="text-info" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-base-content">Account & Security</h2>
          </div>
          <p className="text-sm text-base-content/60 mb-4">
            Your account is secured by Auth0. Password and security settings are managed through your
            authentication provider.
          </p>
          <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
            <div>
              <p className="font-medium text-sm text-base-content">Authentication Provider</p>
              <p className="text-xs text-base-content/60">Auth0 — Industry-leading security</p>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-warning/10 rounded-lg p-2">
              <Key size={18} className="text-warning" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">API Keys</h2>
              <p className="text-xs text-base-content/50">Use API keys to access Certify from external apps</p>
            </div>
          </div>

          {/* Created key banner */}
          {createdKey && (
            <div className="alert alert-warning mb-4 flex-col items-start gap-2 py-3">
              <p className="text-xs font-black uppercase tracking-widest">Save this key — it won't be shown again</p>
              <div className="flex items-center gap-2 w-full">
                <code className="font-mono text-xs bg-warning/20 px-2 py-1 rounded flex-1 break-all">{createdKey}</code>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={handleCopyKey}
                  aria-label="Copy API key"
                >
                  {keyCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <button className="btn btn-xs btn-ghost self-end" onClick={() => setCreatedKey(null)}>Dismiss</button>
            </div>
          )}

          {/* Existing keys */}
          {apiKeys.length > 0 && (
            <div className="mb-4 space-y-2">
              {apiKeys.map((k) => (
                <div key={k._id} className="flex items-center justify-between bg-base-200/50 rounded px-4 py-3 border border-base-200">
                  <div>
                    <p className="font-bold text-sm text-base-content">{k.name}</p>
                    <p className="font-mono text-xs text-base-content/40">{k.keyPreview}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleRevokeKey(k._id)}
                    aria-label={`Revoke key ${k.name}`}
                  >
                    <Trash2 size={14} />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Create new key */}
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Key name (e.g. My Integration)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateKey(); }}
              aria-label="New API key name"
            />
            <button
              className="btn btn-primary btn-sm gap-1.5"
              onClick={handleCreateKey}
              disabled={keyLoading || !newKeyName.trim()}
            >
              {keyLoading ? <span className="loading loading-spinner loading-xs" /> : <Plus size={14} />}
              Create
            </button>
          </div>

          {keyError && (
            <p className="text-error text-xs font-bold mt-2">{keyError}</p>
          )}
        </motion.div>

        {/* Webhooks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 border border-base-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-secondary/10 rounded-lg p-2">
              <Webhook size={18} className="text-secondary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">Webhooks</h2>
              <p className="text-xs text-base-content/50">Receive HTTP notifications on certificate events</p>
            </div>
          </div>

          {/* Created secret banner */}
          {createdSecret && (
            <div className="alert alert-warning mb-4 flex-col items-start gap-2 py-3">
              <p className="text-xs font-black uppercase tracking-widest">Webhook secret — save it now, it won't be shown again</p>
              <div className="flex items-center gap-2 w-full">
                <code className="font-mono text-xs bg-warning/20 px-2 py-1 rounded flex-1 break-all">{createdSecret}</code>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={handleCopySecret}
                  aria-label="Copy webhook secret"
                >
                  {secretCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <button className="btn btn-xs btn-ghost self-end" onClick={() => setCreatedSecret(null)}>Dismiss</button>
            </div>
          )}

          {/* Existing webhooks */}
          {webhooks.length > 0 && (
            <div className="mb-4 space-y-2">
              {webhooks.map((wh) => (
                <div key={wh._id} className="flex items-start justify-between bg-base-200/50 rounded px-4 py-3 border border-base-200 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe size={12} className="text-base-content/40 shrink-0" />
                      <p className="font-mono text-xs text-base-content truncate">{wh.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="badge badge-xs bg-secondary/10 text-secondary border-none font-mono">{ev}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error shrink-0"
                    onClick={() => handleDeleteWebhook(wh._id)}
                    aria-label={`Delete webhook ${wh.url}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Create new webhook */}
          <div className="space-y-3">
            <input
              type="url"
              className="input input-bordered input-sm w-full"
              placeholder="https://your-app.com/webhooks/certify"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              aria-label="Webhook endpoint URL"
            />
            <div className="flex flex-wrap gap-2">
              {ALL_WEBHOOK_EVENTS.map((ev) => (
                <label
                  key={ev}
                  className="flex min-h-[44px] items-center gap-2 rounded px-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary h-5 w-5"
                    checked={newWebhookEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  <span className="font-mono text-[10px] text-base-content/60">{ev}</span>
                </label>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-sm gap-1.5"
              onClick={handleCreateWebhook}
              disabled={webhookLoading || !newWebhookUrl.trim() || newWebhookEvents.length === 0}
            >
              {webhookLoading ? <span className="loading loading-spinner loading-xs" /> : <Plus size={14} />}
              Add Webhook
            </button>
          </div>

          {webhookError && (
            <p className="text-error text-xs font-bold mt-2">{webhookError}</p>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 border border-error/20 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-error/10 rounded-lg p-2">
              <LogOut size={18} className="text-error" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-base-content">Sign Out</h2>
          </div>
          <p className="text-sm text-base-content/60 mb-4">
            Sign out of your Certify account on this device.
          </p>
          <Button variant="error" onClick={handleLogout}>
            Sign Out
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
};
