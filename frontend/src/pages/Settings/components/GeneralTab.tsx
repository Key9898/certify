import { User, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import type { GeneralTabProps } from './types';

export const GeneralTab: React.FC<GeneralTabProps> = ({
  displayName,
  userEmail,
  userPicture,
  appRole,
  orgRole,
  primaryColor,
  secondaryColor,
  setPrimaryColor,
  setSecondaryColor,
  handleSaveColors,
  isSavingColors,
  saved,
  saveError,
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 rounded p-2 text-primary">
            <User size={20} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-base-content">Profile Details</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-4 bg-base-200/30 rounded border border-base-200">
          <div className="relative">
            {userPicture ? (
              <img
                src={userPicture}
                alt={displayName || 'User avatar'}
                className="w-20 h-20 rounded ring-4 ring-primary/20 ring-offset-2 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded bg-primary flex items-center justify-center text-3xl font-black text-primary-content">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-success text-success-content text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm border-2 border-base-100">
              Active
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-black tracking-tight text-base-content">{displayName}</h3>
            <p className="text-base-content/50 font-medium">{userEmail}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <span className="brand-tag !bg-base-100 !border-base-300 !text-base-content/60">
                System: {appRole}
              </span>
              {orgRole && (
                <span className="brand-tag">
                  Workspace: {orgRole}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Legal Name"
            value={displayName}
            readOnly
            hint="Managed by Identity Provider"
            className="bg-base-200/40"
          />
          <Input
            label="Verified Email"
            type="email"
            value={userEmail || ''}
            readOnly
            hint="Identity authentication address"
            className="bg-base-200/40"
          />
        </div>
      </motion.div>

      {/* Default Branding Colors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-accent/10 rounded p-2 text-accent">
            <Palette size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-base-content">Issuance Defaults</h2>
            <p className="text-sm text-base-content/55 font-medium">Pre-fill theme colors for new certificate designs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="form-control group">
            <label className="label mb-2" htmlFor="settings-primary">
              <span className="meta-label">Primary Identity</span>
            </label>
            <div className="flex items-center gap-4 bg-base-200/30 p-4 rounded border border-base-200 transition-colors group-hover:border-primary/30">
              <input
                id="settings-primary"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-14 h-14 rounded cursor-pointer border-2 border-base-100 shadow-sm"
                aria-label="Primary color picker"
              />
              <div>
                <p className="font-mono text-lg font-black text-base-content">{primaryColor.toUpperCase()}</p>
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Main Action Color</p>
              </div>
            </div>
          </div>

          <div className="form-control group">
            <label className="label mb-2" htmlFor="settings-secondary">
              <span className="meta-label">Secondary Accent</span>
            </label>
            <div className="flex items-center gap-4 bg-base-200/30 p-4 rounded border border-base-200 transition-colors group-hover:border-base-400">
              <input
                id="settings-secondary"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-14 h-14 rounded cursor-pointer border-2 border-base-100 shadow-sm"
                aria-label="Secondary color picker"
              />
              <div>
                <p className="font-mono text-lg font-black text-base-content">{secondaryColor.toUpperCase()}</p>
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Support Tone Color</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-base-200 pt-6">
          <div className="flex-1 mr-4">
            {saved && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-success text-sm font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Preference tokens updated successfully!
              </motion.div>
            )}
            {saveError && (
              <div className="text-error text-sm font-bold">{saveError}</div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleSaveColors}
            isLoading={isSavingColors}
            className="font-black tracking-widest uppercase text-xs px-8"
          >
            Update Tokens
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
