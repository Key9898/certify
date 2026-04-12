import React, { useState, useCallback } from 'react';
import { Award, Users, Shield } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { FileUpload } from '@/components/common/FileUpload';
import { useCloudinary } from '@/hooks/useCloudinary';
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
} from '@/utils/constants';
import type {
  CertificateFormProps,
  CertificateFormData,
} from './CertificateForm.types';
import type { CreateCertificateDto } from '@/types';

const getInitialState = (
  templateId: string,
  initial?: Partial<CertificateFormData>
): CertificateFormData => ({
  templateId,
  recipientName: '',
  recipientEmail: '',
  certificateTitle: 'Certificate of Achievement',
  description: '',
  issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  issuerName: '',
  issuerSignature: '',
  organizationLogo: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_SECONDARY_COLOR,
  ...initial,
});

export const CertificateForm: React.FC<CertificateFormProps> = ({
  initialData,
  templateId,
  template,
  onSubmit,
  onChange,
  isSubmitting = false,
}) => {
  const [form, setForm] = useState<CertificateFormData>(
    getInitialState(templateId, initialData)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof CertificateFormData, string>>
  >({});
  const { upload, isUploading } = useCloudinary();
  const isBackgroundTemplate =
    template?.mode === 'background' ||
    template?.htmlContent === 'custom-background';

  const set = useCallback(
    (key: keyof CertificateFormData, value: string) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        onChange?.({ [key]: value } as Partial<CertificateFormData>);
        return next;
      });
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [onChange]
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CertificateFormData, string>> = {};
    if (!form.recipientName.trim())
      newErrors.recipientName = 'Recipient name is required';
    if (!form.certificateTitle.trim())
      newErrors.certificateTitle = 'Certificate title is required';
    if (!form.issueDate) newErrors.issueDate = 'Issue date is required';
    if (!form.issuerName.trim())
      newErrors.issuerName = 'Issuer name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoUpload = async (file: File) => {
    const result = await upload(file, 'logos');
    if (result) set('organizationLogo', result.secure_url);
  };

  const handleSignatureUpload = async (file: File) => {
    const result = await upload(file, 'signatures');
    if (result) set('issuerSignature', result.secure_url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateCertificateDto = {
      templateId: form.templateId,
      recipientName: form.recipientName,
      recipientEmail: form.recipientEmail || undefined,
      certificateTitle: form.certificateTitle,
      description: form.description || undefined,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate || undefined,
      issuerName: form.issuerName,
      issuerSignature: form.issuerSignature || undefined,
      organizationLogo: form.organizationLogo || undefined,
      customFields: {
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
      },
    };

    await onSubmit(dto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Recipient Section */}
      <section className="bg-base-100 border border-base-200 rounded p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded">
            <Users size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-black text-base-content tracking-tight">
            Recipient Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Recipient Name *"
            placeholder="e.g. John Smith"
            value={form.recipientName}
            onChange={(e) => set('recipientName', e.target.value)}
            error={errors.recipientName}
          />
          <Input
            label="Recipient Email"
            type="email"
            placeholder="john@example.com"
            value={form.recipientEmail}
            onChange={(e) => set('recipientEmail', e.target.value)}
            hint="Optional — for your records"
          />
        </div>
      </section>

      {/* Certificate Section */}
      <section className="bg-base-100 border border-base-200 rounded p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-accent/10 p-2 rounded">
            <Award size={20} className="text-accent" />
          </div>
          <h3 className="text-lg font-black text-base-content tracking-tight">
            Certificate Details
          </h3>
        </div>
        <div className="space-y-6">
          <Input
            label="Certificate Title *"
            placeholder="Certificate of Achievement"
            value={form.certificateTitle}
            onChange={(e) => set('certificateTitle', e.target.value)}
            error={errors.certificateTitle}
          />
          <div className="form-control w-full">
            <label className="label" htmlFor="description">
              <span className="label-text font-bold text-base-content/70">
                Description
              </span>
            </label>
            <textarea
              id="description"
              className="textarea textarea-bordered w-full rounded focus:textarea-primary min-h-[100px]"
              placeholder="Describe the achievement in a few lines..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Issue Date *"
              type="date"
              value={form.issueDate}
              onChange={(e) => set('issueDate', e.target.value)}
              error={errors.issueDate}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={(e) => set('expiryDate', e.target.value)}
              hint="Leave blank if not applicable"
            />
          </div>
        </div>
      </section>

      {/* Issuer Section */}
      <section className="bg-base-100 border border-base-200 rounded p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-success/10 p-2 rounded">
            <Shield size={20} className="text-success" />
          </div>
          <h3 className="text-lg font-black text-base-content tracking-tight">
            Program
          </h3>
        </div>
        <div className="space-y-6">
          <Input
            label="Program Name *"
            placeholder="e.g. Acme Academy"
            value={form.issuerName}
            onChange={(e) => set('issuerName', e.target.value)}
            error={errors.issuerName}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Organization Logo"
              accept="image/png,image/jpeg,image/svg+xml"
              onFileSelect={handleLogoUpload}
              previewUrl={form.organizationLogo || undefined}
              hint="Recommend square PNG/SVG"
              isUploading={isUploading}
            />
            <FileUpload
              label="Signature"
              accept="image/png"
              onFileSelect={handleSignatureUpload}
              previewUrl={form.issuerSignature || undefined}
              hint="Transparent PNG works best"
              isUploading={isUploading}
            />
          </div>

          {!isBackgroundTemplate ? (
            <div className="p-4 bg-base-200/50 rounded">
              <p className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">
                Template Colors
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 bg-base-100 rounded border border-base-200">
                  <div className="flex items-center gap-3">
                    <input
                      id="primaryColor"
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => set('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent overflow-hidden"
                    />
                    <div>
                      <label
                        htmlFor="primaryColor"
                        className="text-sm font-bold text-base-content block"
                      >
                        Primary Color
                      </label>
                      <span className="text-xs font-mono text-base-content/50 uppercase">
                        {form.primaryColor}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-base-100 rounded border border-base-200">
                  <div className="flex items-center gap-3">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) => set('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent overflow-hidden"
                    />
                    <div>
                      <label
                        htmlFor="secondaryColor"
                        className="text-sm font-bold text-base-content block"
                      >
                        Secondary Color
                      </label>
                      <span className="text-xs font-mono text-base-content/50 uppercase">
                        {form.secondaryColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-base-200 bg-base-200/40 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-base-content/40">
                Background Template Mode
              </p>
              <p className="mt-2 text-sm text-base-content/60">
                Layout colors and positions come from the imported background
                template. The form values below will be injected into the fields
                you configured in Template Builder.
              </p>
            </div>
          )}
        </div>
      </section>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        size="lg"
      >
        {isSubmitting ? 'Creating Certificate...' : 'Create Certificate'}
      </Button>
    </form>
  );
};
