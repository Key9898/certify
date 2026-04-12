import {
  Users,
  Plus,
  Trash2,
  Building2,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import type { WorkspaceTabProps } from './types';

export const WorkspaceTab: React.FC<WorkspaceTabProps> = ({
  teamData,
  teamLoading,
  teamError,
  canManageWorkspace,
  teamActionId,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  handleInviteMember,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleCancelInvitation,
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-info/10 rounded p-2 text-info">
            <Users size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-base-content">
              Personnel & Access
            </h2>
            <p className="text-sm text-base-content/55 font-medium">
              Coordinate issuance and design tasks across your workspace.
            </p>
          </div>
        </div>

        {teamLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-base-content/30 italic">
              Synchronizing team state...
            </p>
          </div>
        ) : (
          <>
            {teamData?.organization && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded border border-base-200 bg-base-200/30 p-5 group hover:bg-base-200/50 transition-colors">
                  <p className="meta-label mb-2 flex items-center gap-1.5">
                    <Building2 size={10} /> Workspace
                  </p>
                  <p className="text-lg font-black text-base-content tracking-tight">
                    {teamData.organization.name}
                  </p>
                </div>
                <div className="rounded border border-base-200 bg-base-200/30 p-5 group hover:bg-base-200/50 transition-colors">
                  <p className="meta-label mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={10} /> Role Access
                  </p>
                  <p className="text-lg font-black text-base-content tracking-tight capitalize">
                    {teamData.members.find((m) => m.isCurrentUser)?.role ||
                      'Member'}
                  </p>
                </div>
                <div className="rounded border border-base-200 bg-base-200/30 p-5 group hover:bg-base-200/50 transition-colors">
                  <p className="meta-label mb-2 flex items-center gap-1.5">
                    <Plus size={10} /> Seats Used
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-base-content tracking-tight">
                      {teamData.members.length}
                    </p>
                    <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                      Active Accounts
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!canManageWorkspace && (
              <div className="alert border-info/20 bg-info/5 rounded mb-6 flex items-start gap-3 p-4">
                <ShieldCheck className="text-info shrink-0 h-5 w-5" />
                <span className="text-sm font-medium text-base-content/75">
                  Restricted Access: Only workspace Owners and Administrators
                  can orchestrate invitations and modify teammate roles.
                </span>
              </div>
            )}

            {teamError && (
              <div className="alert alert-error rounded mb-6 p-4">
                <span className="text-sm font-black tracking-tight">
                  {teamError}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="meta-label">Active Workspace Roster</p>
              </div>
              {teamData?.members.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + index * 0.05 }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded border border-base-200 bg-base-100 hover:border-primary/20 hover:shadow-sm px-5 py-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-base-200 text-base-content/60 font-black text-xs uppercase tracking-widest border border-base-300">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-base-content tracking-tight">
                          {member.name}
                        </p>
                        {member.isCurrentUser && (
                          <span className="brand-tag !px-2 !py-0.5">You</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-base-content/40 flex items-center gap-1.5">
                        <Mail size={10} /> {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t border-base-200 pt-3 md:border-none md:pt-0">
                    <span className="badge badge-outline border-base-300 px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-base-content/50 capitalize">
                      {member.role}
                    </span>
                    {canManageWorkspace &&
                      member.role !== 'owner' &&
                      !member.isCurrentUser && (
                        <div className="flex items-center gap-2">
                          <select
                            className="select select-bordered select-sm rounded font-bold text-[11px] h-9 min-h-[36px]"
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateMemberRole(
                                member._id,
                                e.target.value as 'admin' | 'member'
                              )
                            }
                            disabled={!!teamActionId}
                            aria-label={`Change role for ${member.name}`}
                          >
                            <option value="member">Member Access</option>
                            <option value="admin">Admin Root</option>
                          </select>
                          <button
                            className="btn btn-ghost btn-sm text-error h-9 min-h-[36px]"
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={!!teamActionId}
                            aria-label={`Revoke access for ${member.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                  </div>
                </motion.div>
              ))}
            </div>

            {canManageWorkspace && (
              <div className="rounded border border-primary/10 bg-primary/5 p-6 mt-8">
                <p className="meta-label !text-primary mb-4 flex items-center gap-2">
                  <Plus size={14} /> Onboard New Teammate
                </p>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] items-end gap-5">
                  <Input
                    label="Invitation Email"
                    type="email"
                    placeholder="name@organization.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-11 bg-base-100"
                  />
                  <div className="form-control">
                    <label className="label h-8 p-0 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-base-content/40">
                        Default Role
                      </span>
                    </label>
                    <select
                      className="select select-bordered rounded h-11 min-h-[44px] font-bold text-xs"
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as 'admin' | 'member')
                      }
                      aria-label="Select default role for new team member"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleInviteMember}
                    disabled={teamActionId === 'invite' || !inviteEmail.trim()}
                    className="h-11 font-black uppercase tracking-widest text-xs px-8"
                  >
                    {teamActionId === 'invite' ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      'Send Invite'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {teamData && teamData.invitations.length > 0 && (
              <div className="mt-10">
                <p className="meta-label mb-4 px-1">Awaiting Acceptance</p>
                <div className="space-y-3">
                  {teamData.invitations.map((invitation) => (
                    <div
                      key={invitation._id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded border border-dashed border-base-300 bg-base-200/10 px-5 py-4"
                    >
                      <div>
                        <p className="font-black text-base-content tracking-tight">
                          {invitation.email}
                        </p>
                        <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mt-1">
                          {invitation.role} invite — set for{' '}
                          {new Date(invitation.expiresAt).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-warning badge-sm h-7 px-3 py-0 text-[10px] font-bold uppercase tracking-widest">
                          {invitation.status}
                        </span>
                        {canManageWorkspace && (
                          <button
                            className="btn btn-ghost btn-sm text-error h-8 min-h-[32px] px-3 font-bold text-xs"
                            onClick={() =>
                              handleCancelInvitation(invitation._id)
                            }
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

            <div className="mt-10">
              <RolePermissionMatrix />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
