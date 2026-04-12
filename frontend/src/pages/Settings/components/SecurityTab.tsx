import {
  Shield,
  LogOut,
  AlertTriangle,
  Trash2,
  KeyRound,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { PasswordChangeForm } from './PasswordChangeForm';
import type { SecurityTabProps } from './types';

export const SecurityTab: React.FC<SecurityTabProps> = ({
  isEmailPasswordUser,
  userEmail,
  pwResetStatus: _pwResetStatus,
  pwResetLoading: _pwResetLoading,
  handlePasswordReset: _handlePasswordReset,
  handleLogout,
  showDeleteConfirm,
  setShowDeleteConfirm,
  deleteConfirmText,
  setDeleteConfirmText,
  deleteLoading,
  deleteError,
  handleDeleteAccount,
  setDeleteError,
  pwChangeLoading,
  pwChangeError,
  pwChangeSuccess,
  handleChangePassword,
}) => {
  return (
    <div className="space-y-8">
      {/* Account & Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 border border-base-200 p-8 shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-base-200/60">
          <div className="bg-info/10 rounded p-3 text-info shadow-sm ring-1 ring-info/20">
            <Shield size={26} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-base-content uppercase tracking-widest text-[18px]">
              Security Settings
            </h2>
            <p className="text-sm text-base-content/55 font-medium leading-relaxed">
              Guard your access points and credential integrity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10">
          <div className="space-y-8">
            <div className="p-6 bg-base-200/30 rounded border border-base-200 group hover:border-info/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <KeyRound size={20} className="text-base-content/30" />
                  <p className="meta-label">Login Method</p>
                </div>
                <span className="brand-tag !bg-info/10 !text-info">
                  {isEmailPasswordUser ? 'Email Login' : 'OAuth Verified'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-base-content tracking-tight">
                  {isEmailPasswordUser ? 'Email & Password' : 'Google Identity'}
                </p>
                <p className="text-sm font-medium text-base-content/45">
                  Verified account: {userEmail}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black tracking-tight text-base-content border-l-4 border-info pl-4">
                  Security Actions
                </h3>
              </div>

              {isEmailPasswordUser ? (
                <div className="space-y-4 pt-2">
                  <div className="p-6 rounded bg-base-100 border border-base-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all -rotate-12 translate-x-4">
                      <KeyRound size={80} />
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-base-content text-lg mb-2">
                        Change Password
                      </p>
                      <p className="text-sm font-medium text-base-content/50 leading-relaxed mb-6 max-w-sm">
                        Enter your current password and choose a new secure
                        password for your account.
                      </p>

                      <PasswordChangeForm
                        onChangePassword={handleChangePassword}
                        isLoading={pwChangeLoading}
                        error={pwChangeError}
                        success={pwChangeSuccess}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded bg-success/5 border border-success/10 group hover:border-success/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-success text-success-content shadow-sm">
                      <Globe size={20} />
                    </div>
                    <h4 className="font-black text-xl text-base-content tracking-tight">
                      External Identity Protection
                    </h4>
                  </div>
                  <p className="text-sm font-medium text-base-content/55 leading-relaxed mb-6">
                    Your Hub credentials are encrypted and strictly managed
                    through Google Workspace. Direct password manipulation is
                    handled by their global security infrastructure.
                  </p>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost hover:bg-success/10 h-12 rounded text-success font-black uppercase tracking-widest text-[11px] border-success/20 hover:border-success/30"
                  >
                    Manage Google Security <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-base-200/20 rounded border border-base-200 relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2">
                <LogOut size={120} />
              </div>
              <p className="meta-label mb-3 ml-1">Session</p>
              <h3 className="text-xl font-black text-base-content tracking-tight mb-2">
                Active Session
              </h3>
              <p className="text-sm font-medium text-base-content/50 leading-relaxed mb-8">
                Instantly revoke current browser tokens and end all active
                connections on this local portal.
              </p>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full h-12 border-base-300 hover:bg-base-200 rounded font-black uppercase tracking-widest text-[11px] gap-2"
              >
                <LogOut size={16} /> Sign Out
              </Button>
            </div>

            <div className="p-8 border border-error/20 bg-error/[0.03] rounded group transition-all hover:bg-error/[0.06] hover:border-error/40 shadow-sm shadow-error/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 flex items-center justify-center rounded bg-error/10 text-error shadow-sm group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-error tracking-tight">
                    Danger Zone
                  </h3>
                  <p className="meta-label !text-error/40">Account Deletion</p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-base-content/60 leading-relaxed">
                    Permanently purge your account, all created certificates,
                    secure templates, and entire workspace history from our
                    global infrastructure.
                  </p>
                  <Button
                    variant="error"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded shadow-lg shadow-error/10 border-none"
                  >
                    <Trash2 size={16} /> Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="alert border-error/40 bg-error/10 py-4 rounded gap-3 text-error">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      This Operation is Final and Irreversible
                    </span>
                  </div>
                  <div className="space-y-3">
                    <label className="label h-6 p-0 ml-1">
                      <span className="meta-label !text-error/60">
                        Type 'DELETE' to confirm terminal protocol
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered h-12 w-full border-error/40 rounded bg-base-100 font-mono text-center text-error font-black uppercase tracking-[0.3em] placeholder:text-error/20"
                      placeholder="DELETE"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                    />
                  </div>
                  {deleteError && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-error text-center px-4">
                      {deleteError}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="error"
                      onClick={handleDeleteAccount}
                      isLoading={deleteLoading}
                      disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                      className="h-12 font-black uppercase tracking-widest text-[10px] rounded"
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setDeleteError(null);
                      }}
                      disabled={deleteLoading}
                      className="h-12 border-base-200 hover:bg-base-200 text-base-content/60 font-black uppercase tracking-widest text-[10px] rounded"
                    >
                      Abort
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
