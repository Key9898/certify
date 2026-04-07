import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppUser } from '@/context/AuthContext';
import { useCloudinary } from '@/hooks/useCloudinary';
import { patch, del } from '@/utils/api';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from '@/utils/constants';
import { getAuthProfileDisplayName } from '@/utils/formatters';
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

import { SettingsSidebar } from './components/SettingsSidebar';
import { GeneralTab } from './components/GeneralTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { BrandingTab } from './components/BrandingTab';
import { DeveloperTab } from './components/DeveloperTab';
import { SecurityTab } from './components/SecurityTab';
import type { SettingsTab } from './components/types';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth0();
  const { appUser, setAppUser } = useAppUser();
  const displayName = getAuthProfileDisplayName(user);
  const { upload, isUploading } = useCloudinary();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

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

  // Team state
  const [teamData, setTeamData] = useState<TeamWorkspace | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamActionId, setTeamActionId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  // Branding state
  const [organizationName, setOrganizationName] = useState(appUser?.organization?.name || '');
  const [brandName, setBrandName] = useState(appUser?.organization?.whiteLabel.brandName || '');
  const [brandLogoUrl, setBrandLogoUrl] = useState(appUser?.organization?.whiteLabel.logoUrl || '');
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
  const isEmailPasswordUser = user?.sub?.startsWith('auth0|') ?? false;

  // Password reset state
  const [pwResetLoading, setPwResetLoading] = useState(false);
  const [pwResetStatus, setPwResetStatus] = useState<'sent' | 'error' | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await listApiKeys();
      setApiKeys(res.data ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await listWebhooks();
      setWebhooks(res.data ?? []);
    } catch {
      /* ignore */
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
    setBrandPrimaryColor(appUser.organization?.whiteLabel.primaryColor || DEFAULT_PRIMARY_COLOR);
    setBrandSecondaryColor(appUser.organization?.whiteLabel.secondaryColor || DEFAULT_SECONDARY_COLOR);
    setSupportEmail(appUser.organization?.whiteLabel.supportEmail || '');
    setCustomDomain(appUser.organization?.whiteLabel.customDomain || '');
    setHidePoweredBy(appUser.organization?.whiteLabel.hidePoweredBy || false);
  }, [appUser]);

  const handleSaveColors = async () => {
    setIsSavingColors(true);
    setSaveError(null);
    try {
      const res = await patch<AppUser>('/users/settings', {
        defaultColors: { primary: primaryColor, secondary: secondaryColor },
      });
      if (res.data) setAppUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setIsSavingColors(false);
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

  const handleUpdateMemberRole = async (userId: string, role: 'admin' | 'member') => {
    setTeamActionId(userId);
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
    try {
      await cancelWorkspaceInvitation(invitationId);
      await loadTeamWorkspace();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to cancel invitation.');
    } finally {
      setTeamActionId(null);
    }
  };

  const handleUploadBrandLogo = async (file: File) => {
    const result = await upload(file, 'logos');
    if (result) setBrandLogoUrl(result.secure_url);
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
      if (res.data) setAppUser(res.data);
      await loadTeamWorkspace();
      setWhiteLabelSaved(true);
      setTimeout(() => setWhiteLabelSaved(false), 2500);
    } catch (err) {
      setWhiteLabelError(err instanceof Error ? err.message : 'Failed to save white label.');
    } finally {
      setIsSavingWhiteLabel(false);
    }
  };

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
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
  };

  const handleCopySecret = () => {
    if (createdSecret) {
      navigator.clipboard.writeText(createdSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const toggleEvent = (event: WebhookEvent) => {
    setNewWebhookEvents((prev: WebhookEvent[]) =>
      prev.includes(event) ? prev.filter((e: WebhookEvent) => e !== event) : [...prev, event]
    );
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPwResetLoading(true);
    setPwResetStatus(null);
    try {
      const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
      const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
      const response = await fetch(`https://${auth0Domain}/dbconnections/change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: auth0ClientId,
          email: user.email,
          connection: 'Username-Password-Authentication',
        }),
      });
      setPwResetStatus(response.ok ? 'sent' : 'error');
    } catch {
      setPwResetStatus('error');
    } finally {
      setPwResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await del('/users/account');
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-12 max-w-[1440px] mx-auto min-h-[calc(100vh-140px)]">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SOFT_SPRING}
            >
              {activeTab === 'general' && (
                <GeneralTab
                  displayName={displayName}
                  userEmail={user?.email}
                  userPicture={user?.picture}
                  appRole={appUser?.role || 'user'}
                  orgRole={appUser?.organizationRole}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  setPrimaryColor={setPrimaryColor}
                  setSecondaryColor={setSecondaryColor}
                  handleSaveColors={handleSaveColors}
                  isSavingColors={isSavingColors}
                  saved={saved}
                  saveError={saveError}
                />
              )}

              {activeTab === 'workspace' && (
                <WorkspaceTab
                  teamData={teamData}
                  teamLoading={teamLoading}
                  teamError={teamError}
                  canManageWorkspace={canManageWorkspace}
                  teamActionId={teamActionId}
                  inviteEmail={inviteEmail}
                  setInviteEmail={setInviteEmail}
                  inviteRole={inviteRole}
                  setInviteRole={setInviteRole}
                  handleInviteMember={handleInviteMember}
                  handleUpdateMemberRole={handleUpdateMemberRole}
                  handleRemoveMember={handleRemoveMember}
                  handleCancelInvitation={handleCancelInvitation}
                />
              )}

              {activeTab === 'branding' && (
                <BrandingTab
                  canManageWorkspace={canManageWorkspace}
                  organizationName={organizationName}
                  setOrganizationName={setOrganizationName}
                  brandName={brandName}
                  setBrandName={setBrandName}
                  brandLogoUrl={brandLogoUrl}
                  handleUploadBrandLogo={handleUploadBrandLogo}
                  isUploading={isUploading}
                  brandPrimaryColor={brandPrimaryColor}
                  setBrandPrimaryColor={setBrandPrimaryColor}
                  brandSecondaryColor={brandSecondaryColor}
                  setBrandSecondaryColor={setBrandSecondaryColor}
                  supportEmail={supportEmail}
                  setSupportEmail={setSupportEmail}
                  customDomain={customDomain}
                  setCustomDomain={setCustomDomain}
                  hidePoweredBy={hidePoweredBy}
                  setHidePoweredBy={setHidePoweredBy}
                  handleSaveWhiteLabel={handleSaveWhiteLabel}
                  isSavingWhiteLabel={isSavingWhiteLabel}
                  whiteLabelSaved={whiteLabelSaved}
                  whiteLabelError={whiteLabelError}
                />
              )}

              {activeTab === 'developer' && (
                <DeveloperTab
                  apiKeys={apiKeys}
                  newKeyName={newKeyName}
                  setNewKeyName={setNewKeyName}
                  handleCreateKey={handleCreateKey}
                  handleRevokeKey={handleRevokeKey}
                  createdKey={createdKey}
                  setCreatedKey={setCreatedKey}
                  handleCopyKey={handleCopyKey}
                  keyCopied={keyCopied}
                  keyLoading={keyLoading}
                  keyError={keyError}
                  webhooks={webhooks}
                  newWebhookUrl={newWebhookUrl}
                  setNewWebhookUrl={setNewWebhookUrl}
                  newWebhookEvents={newWebhookEvents}
                  toggleEvent={toggleEvent}
                  handleCreateWebhook={handleCreateWebhook}
                  handleDeleteWebhook={handleDeleteWebhook}
                  webhookLoading={webhookLoading}
                  webhookError={webhookError}
                  createdSecret={createdSecret}
                  setCreatedSecret={setCreatedSecret}
                  handleCopySecret={handleCopySecret}
                  secretCopied={secretCopied}
                />
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  isEmailPasswordUser={isEmailPasswordUser}
                  userEmail={user?.email}
                  pwResetStatus={pwResetStatus}
                  pwResetLoading={pwResetLoading}
                  handlePasswordReset={handlePasswordReset}
                  handleLogout={handleLogout}
                  showDeleteConfirm={showDeleteConfirm}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                  deleteConfirmText={deleteConfirmText}
                  setDeleteConfirmText={setDeleteConfirmText}
                  deleteLoading={deleteLoading}
                  deleteError={deleteError}
                  handleDeleteAccount={handleDeleteAccount}
                  setDeleteError={setDeleteError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
};
