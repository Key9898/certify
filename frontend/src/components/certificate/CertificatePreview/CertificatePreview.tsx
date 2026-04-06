import React from 'react';
import { formatDate } from '@/utils/formatters';
import type { CertificatePreviewProps } from './CertificatePreview.types';

const getTemplateMode = (templateName?: string, explicitMode?: string): 'preset' | 'background' => {
  if (explicitMode === 'background' || templateName === 'custom-background') {
    return 'background';
  }
  return 'preset';
};

const resolveFieldValue = (
  name: string,
  data: CertificatePreviewProps['data'],
  formattedIssueDate: string
): string => {
  const valueMap: Record<string, string> = {
    recipientName: data.recipientName || 'Recipient Name',
    certificateTitle: data.certificateTitle || 'Certificate of Achievement',
    description: data.description || 'Describe the achievement or completion details here.',
    issueDate: formattedIssueDate,
    expiryDate: data.expiryDate
      ? formatDate(data.expiryDate, { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No expiry date',
    issuerName: data.issuerName || 'Issuer Name',
    certificateId: data.certificateId || 'CERT-2026-001',
    issuerSignature: data.issuerSignature || '',
    organizationLogo: data.organizationLogo || '',
  };

  return valueMap[name] || '';
};

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data, template, templateName }) => {
  const {
    recipientName,
    certificateTitle,
    description,
    issueDate,
    issuerName,
    issuerSignature,
    organizationLogo,
    primaryColor,
  } = data;

  const formattedDate = issueDate
    ? formatDate(issueDate, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Date not set';
  const templateMode = getTemplateMode(templateName || template?.htmlContent, template?.mode);

  if (templateMode === 'background' && template?.backgroundImageUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded border bg-white aspect-[297/210] shadow-sm">
        <img
          src={template.backgroundImageUrl}
          alt={`${template.name} background`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {(template.fields || [])
          .filter((field) => field.visible !== false)
          .map((field) => {
            const value = resolveFieldValue(field.name, data, formattedDate) || field.defaultValue || '';
            const width = field.size?.width ?? (field.type === 'image' ? 18 : 32);

            if (field.type === 'image') {
              return value ? (
                <img
                  key={field.name}
                  src={value}
                  alt={field.label}
                  className="absolute object-contain"
                  style={{
                    left: `${field.position.x}%`,
                    top: `${field.position.y}%`,
                    width: `${width}%`,
                    height: field.size?.height ? `${field.size.height}%` : undefined,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ) : null;
            }

            if (!value) {
              return null;
            }

            return (
              <div
                key={field.name}
                className="absolute break-words whitespace-pre-wrap"
                style={{
                  left: `${field.position.x}%`,
                  top: `${field.position.y}%`,
                  width: `${width}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${field.style?.fontSize ?? 24}px`,
                  fontWeight: field.style?.fontWeight ?? 600,
                  fontFamily: field.style?.fontFamily || 'Arial, sans-serif',
                  color: field.style?.color || primaryColor,
                  textAlign: field.style?.textAlign || 'center',
                  lineHeight: field.style?.lineHeight ?? 1.2,
                  letterSpacing: `${field.style?.letterSpacing ?? 0}px`,
                  fontStyle: field.style?.fontStyle || 'normal',
                  textTransform: field.style?.textTransform || 'none',
                }}
              >
                {value}
              </div>
            );
          })}
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded border-4 bg-white aspect-[297/210]"
      style={{ borderColor: primaryColor }}
    >
      {/* Inner border */}
      <div
        className="absolute inset-3 border rounded opacity-20 pointer-events-none"
        style={{ borderColor: primaryColor }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {/* Logo */}
        {organizationLogo && (
          <img src={organizationLogo} alt="Organization logo" className="h-10 max-w-[120px] object-contain mb-3" />
        )}

        {/* Certificate Label */}
        <p
          className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
          style={{ color: primaryColor }}
        >
          Certificate of Achievement
        </p>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {certificateTitle || 'Certificate Title'}
        </h2>

        {/* Divider */}
        <div
          className="w-24 h-0.5 mb-4 rounded"
          style={{ background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }}
        />

        {/* Recipient */}
        <p className="text-sm text-gray-500 mb-1">This certificate is proudly presented to</p>
        <p
          className="text-3xl font-bold italic mb-3 font-serif"
          style={{ color: primaryColor }}
        >
          {recipientName || 'Recipient Name'}
        </p>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">{description}</p>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end w-full mt-auto">
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-700">{formattedDate}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Date of Issue</p>
          </div>
          <div className="text-right">
            {issuerSignature && (
              <img src={issuerSignature} alt="Signature" className="h-8 max-w-[100px] object-contain mb-1 ml-auto" />
            )}
            <p className="text-xs font-semibold text-gray-700">{issuerName || 'Issuer Name'}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
