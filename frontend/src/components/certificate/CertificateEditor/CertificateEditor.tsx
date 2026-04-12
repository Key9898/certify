import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CertificateForm } from '../CertificateForm';
import { CertificatePreview } from '../CertificatePreview';
import { TemplatePreview } from '@/components/template/TemplatePreview';
import { useAppUser } from '@/context/AuthContext';
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
} from '@/utils/constants';
import type { CertificateEditorProps } from './CertificateEditor.types';
import type { CreateCertificateDto } from '@/types';
import type { CertificateFormData } from '../CertificateForm/CertificateForm.types';
import type { PreviewData } from '../CertificatePreview/CertificatePreview.types';

const defaultPreview: PreviewData = {
  recipientName: '',
  certificateTitle: 'Certificate of Achievement',
  description: '',
  issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  issuerName: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_SECONDARY_COLOR,
  certificateId: 'CERT-2026-001',
};

export const CertificateEditor: React.FC<CertificateEditorProps> = ({
  template,
  onComplete,
  isSubmitting = false,
}) => {
  const { appUser } = useAppUser();
  const initialPrimaryColor =
    appUser?.organization?.whiteLabel.primaryColor ||
    appUser?.settings.defaultColors.primary ||
    DEFAULT_PRIMARY_COLOR;
  const initialSecondaryColor =
    appUser?.organization?.whiteLabel.secondaryColor ||
    appUser?.settings.defaultColors.secondary ||
    DEFAULT_SECONDARY_COLOR;
  const initialOrganizationLogo =
    appUser?.settings.defaultLogo ||
    appUser?.organization?.whiteLabel.logoUrl ||
    '';
  const [previewData, setPreviewData] = useState<PreviewData>({
    ...defaultPreview,
    organizationLogo: initialOrganizationLogo,
    primaryColor: initialPrimaryColor,
    secondaryColor: initialSecondaryColor,
  });

  const handleFormChange = useCallback(
    (formData: Partial<CertificateFormData>) => {
      setPreviewData((prev) => ({
        ...prev,
        recipientName: formData.recipientName ?? prev.recipientName,
        certificateTitle: formData.certificateTitle ?? prev.certificateTitle,
        description: formData.description ?? prev.description,
        issueDate: formData.issueDate ?? prev.issueDate,
        expiryDate: formData.expiryDate ?? prev.expiryDate,
        issuerName: formData.issuerName ?? prev.issuerName,
        issuerSignature: formData.issuerSignature ?? prev.issuerSignature,
        organizationLogo: formData.organizationLogo ?? prev.organizationLogo,
        primaryColor: formData.primaryColor ?? prev.primaryColor,
        secondaryColor: formData.secondaryColor ?? prev.secondaryColor,
      }));
    },
    []
  );

  const handleSubmit = async (data: CreateCertificateDto) => {
    const formData: CertificateFormData = {
      templateId: data.templateId,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail || '',
      certificateTitle: data.certificateTitle,
      description: data.description || '',
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || '',
      issuerName: data.issuerName,
      issuerSignature: data.issuerSignature || '',
      organizationLogo: data.organizationLogo || '',
      primaryColor: data.customFields?.primaryColor || DEFAULT_PRIMARY_COLOR,
      secondaryColor:
        data.customFields?.secondaryColor || DEFAULT_SECONDARY_COLOR,
    };
    await onComplete(formData);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left: Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 pb-2 border-b border-base-200">
          <TemplatePreview
            template={template}
            className="w-16 h-12 object-cover"
          />
          <div>
            <h3 className="font-bold text-base-content">{template.name}</h3>
            <p className="text-xs text-base-content/60 capitalize">
              {template.category}
            </p>
          </div>
        </div>
        <CertificateForm
          templateId={template._id}
          template={template}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          isSubmitting={isSubmitting}
          initialData={{
            organizationLogo: initialOrganizationLogo,
            primaryColor: initialPrimaryColor,
            secondaryColor: initialSecondaryColor,
          }}
        />
      </motion.div>

      {/* Right: Live Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-20 h-fit"
      >
        <p className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">
          Live Preview
        </p>
        <CertificatePreview
          data={previewData}
          template={template}
          templateName={template.htmlContent}
        />
        <p className="text-xs text-base-content/40 text-center mt-2">
          Preview updates as you type
        </p>
      </motion.div>
    </div>
  );
};
