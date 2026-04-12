import { Building2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { FileUpload } from '@/components/common/FileUpload';
import type { BrandingTabProps } from './types';

export const BrandingTab: React.FC<BrandingTabProps> = ({
  canManageWorkspace,
  organizationName,
  setOrganizationName,
  brandName,
  setBrandName,
  brandLogoUrl,
  handleUploadBrandLogo,
  isUploading,
  brandPrimaryColor,
  setBrandPrimaryColor,
  brandSecondaryColor,
  setBrandSecondaryColor,
  supportEmail,
  setSupportEmail,
  customDomain,
  setCustomDomain,
  hidePoweredBy,
  setHidePoweredBy,
  handleSaveWhiteLabel,
  isSavingWhiteLabel,
  whiteLabelSaved,
  whiteLabelError,
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-base-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 rounded p-2 text-secondary">
              <Building2 size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-base-content uppercase tracking-widest text-[16px] mb-1">
                White Label Identity
              </h2>
              <p className="text-sm text-base-content/55 font-medium leading-relaxed">
                Customize verification pages to reflect your premium branding.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-base-200/40 px-4 py-2 rounded border border-base-200">
            <ShieldCheck size={16} className="text-base-content/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30 italic">
              Corporate Tier
            </span>
          </div>
        </div>

        {!canManageWorkspace && (
          <div className="alert border-info/20 bg-info/5 rounded mb-8 flex items-start gap-4 p-5">
            <ShieldCheck className="text-info shrink-0 h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-black text-base-content/80 tracking-tight mb-0.5">
                Administrative-Only View
              </p>
              <p className="text-xs font-medium text-base-content/50 leading-relaxed">
                White-label branding and public-facing identity settings are
                managed exclusively by Workspace Owners.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
          <div className="space-y-6">
            <Input
              label="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Luxio Global Academy"
              disabled={!canManageWorkspace}
              className="h-11 bg-base-200/10"
              hint="Primary administrative identity name."
            />
            <Input
              label="Program Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Luxio Cloud Certificates"
              disabled={!canManageWorkspace}
              className="h-11 bg-base-200/10"
              hint="The name shown on verification dashboards."
            />
          </div>
          <div className="space-y-6">
            <Input
              label="Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@yourcompany.com"
              disabled={!canManageWorkspace}
              className="h-11 bg-base-200/10"
              hint="Shown as the support contact for recipients."
            />
            <Input
              label="Custom Verify Link"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="verify.organization.com"
              hint="Your custom domain for certificate verification."
              disabled={!canManageWorkspace}
              className="h-11 bg-base-200/10"
            />
          </div>
        </div>

        <div className="mb-8 p-6 bg-base-200/20 rounded border border-base-200/60">
          <FileUpload
            label="Organization Logo"
            accept="image/png,image/jpeg,image/svg+xml"
            onFileSelect={handleUploadBrandLogo}
            previewUrl={brandLogoUrl || undefined}
            hint="Upload a vector or high-res PNG for verification pages."
            isUploading={isUploading}
            disabled={!canManageWorkspace}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="form-control group">
            <label className="label mb-3" htmlFor="brand-primary">
              <span className="meta-label">Visual Primary Identity</span>
            </label>
            <div className="flex items-center gap-5 bg-base-200/30 p-5 rounded border border-base-200 group-hover:border-primary/20 transition-all">
              <input
                id="brand-primary"
                type="color"
                value={brandPrimaryColor}
                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                className="w-16 h-16 rounded cursor-pointer border-4 border-base-100 shadow-md ring-1 ring-base-200"
                disabled={!canManageWorkspace}
              />
              <div>
                <p className="font-mono text-xl font-black text-base-content tracking-tight">
                  {brandPrimaryColor.toUpperCase()}
                </p>
                <p className="text-[10px] font-black text-base-content/30 uppercase tracking-[0.22em] mt-1 italic">
                  Brand Lead Tone
                </p>
              </div>
            </div>
          </div>
          <div className="form-control group">
            <label className="label mb-3" htmlFor="brand-secondary">
              <span className="meta-label">Secondary Accent Tone</span>
            </label>
            <div className="flex items-center gap-5 bg-base-200/30 p-5 rounded border border-base-200 group-hover:border-base-400 transition-all">
              <input
                id="brand-secondary"
                type="color"
                value={brandSecondaryColor}
                onChange={(e) => setBrandSecondaryColor(e.target.value)}
                className="w-16 h-16 rounded cursor-pointer border-4 border-base-100 shadow-md ring-1 ring-base-200"
                disabled={!canManageWorkspace}
              />
              <div>
                <p className="font-mono text-xl font-black text-base-content tracking-tight">
                  {brandSecondaryColor.toUpperCase()}
                </p>
                <p className="text-[10px] font-black text-base-content/30 uppercase tracking-[0.22em] mt-1 italic">
                  Visual Balance Tone
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 bg-primary/[0.03] rounded border border-primary/10 transition-all hover:bg-primary/[0.06] mb-8 cursor-pointer">
          <div className="flex-1">
            <p className="font-black text-[15px] text-base-content/80 tracking-tight flex items-center gap-2">
              Discrete White Labeling{' '}
              <span className="brand-tag !h-5 !px-3 !py-1 !tracking-widest !text-[9px] mb-0.5">
                Enterprise
              </span>
            </p>
            <p className="text-xs font-medium text-base-content/45 leading-relaxed mt-1">
              Remove all platform attribution from recipient verification
              dashboards.
            </p>
          </div>
          <label className="flex h-11 w-11 items-center justify-center rounded bg-base-100 shadow-sm border border-base-200 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary h-6 w-6"
              checked={hidePoweredBy}
              onChange={(e) => setHidePoweredBy(e.target.checked)}
              disabled={!canManageWorkspace}
              aria-label="Toggle discrete white labeling"
            />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-base-200/60 pt-8">
          <div className="flex-1 mr-6">
            {whiteLabelSaved && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="alert border-success/30 bg-success/10 py-3 rounded gap-3"
              >
                <ShieldCheck size={16} className="text-success" />
                <span className="text-xs font-black uppercase tracking-widest text-success">
                  White-label parameters synced!
                </span>
              </motion.div>
            )}
            {whiteLabelError && (
              <div className="text-error text-xs font-black uppercase tracking-widest px-1">
                {whiteLabelError}
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleSaveWhiteLabel}
            isLoading={isSavingWhiteLabel}
            disabled={!canManageWorkspace}
            className="font-black uppercase tracking-widest text-xs h-12 px-10 rounded shadow-lg shadow-primary/20"
          >
            Commit Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
