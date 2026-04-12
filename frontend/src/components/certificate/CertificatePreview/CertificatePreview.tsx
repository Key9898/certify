import React from 'react';
import { formatDate } from '@/utils/formatters';
import type { CertificatePreviewProps } from './CertificatePreview.types';

const getTemplateMode = (
  templateName?: string,
  explicitMode?: string
): 'preset' | 'background' => {
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
    description:
      data.description ||
      'Describe the achievement or completion details here.',
    issueDate: formattedIssueDate,
    expiryDate: data.expiryDate
      ? formatDate(data.expiryDate, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'No expiry date',
    issuerName: data.issuerName || 'Program Name',
    certificateId: data.certificateId || 'CERT-2026-001',
    issuerSignature: data.issuerSignature || '',
    organizationLogo: data.organizationLogo || '',
  };

  return valueMap[name] || '';
};

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  template,
  templateName,
}) => {
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
  const templateMode = getTemplateMode(
    templateName || template?.htmlContent,
    template?.mode
  );

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
            const value =
              resolveFieldValue(field.name, data, formattedDate) ||
              field.defaultValue ||
              '';
            const width =
              field.size?.width ?? (field.type === 'image' ? 18 : 32);

            if (field.type === 'image') {
              return value ? (
                <img
                  key={field.name}
                  src={value}
                  alt={field.label}
                  className="certificate-template-field-image"
                  style={
                    {
                      '--field-x': `${field.position.x}%`,
                      '--field-y': `${field.position.y}%`,
                      '--field-width': `${width}%`,
                      '--field-height': field.size?.height
                        ? `${field.size.height}%`
                        : 'auto',
                    } as React.CSSProperties
                  }
                />
              ) : null;
            }

            if (!value) {
              return null;
            }

            return (
              <div
                key={field.name}
                className="certificate-template-field-text"
                style={
                  {
                    '--field-x': `${field.position.x}%`,
                    '--field-y': `${field.position.y}%`,
                    '--field-width': `${width}%`,
                    '--field-font-size': `${field.style?.fontSize ?? 24}px`,
                    '--field-font-weight': field.style?.fontWeight ?? 600,
                    '--field-font-family':
                      field.style?.fontFamily || 'Arial, sans-serif',
                    '--field-color': field.style?.color || primaryColor,
                    '--field-text-align': field.style?.textAlign || 'center',
                    '--field-line-height': field.style?.lineHeight ?? 1.2,
                    '--field-letter-spacing': `${field.style?.letterSpacing ?? 0}px`,
                    '--field-font-style': field.style?.fontStyle || 'normal',
                    '--field-text-transform':
                      field.style?.textTransform || 'none',
                  } as React.CSSProperties
                }
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
      className="certificate-preview-container"
      style={{ '--preview-primary': primaryColor } as React.CSSProperties}
    >
      <div className="certificate-preview-inner-border" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {organizationLogo && (
          <img
            src={organizationLogo}
            alt="Organization logo"
            className="h-10 max-w-[120px] object-contain mb-3"
          />
        )}

        <p className="certificate-preview-label">Certificate of Achievement</p>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {certificateTitle || 'Certificate Title'}
        </h2>

        <div className="certificate-preview-divider" />

        <p className="text-sm text-gray-500 mb-1">
          This certificate is proudly presented to
        </p>
        <p className="certificate-preview-recipient">
          {recipientName || 'Recipient Name'}
        </p>

        {description && (
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">
            {description}
          </p>
        )}

        <div className="flex justify-between items-end w-full mt-auto">
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-700">
              {formattedDate}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Date of Issue
            </p>
          </div>
          <div className="text-right">
            {issuerSignature && (
              <img
                src={issuerSignature}
                alt="Signature"
                className="h-8 max-w-[100px] object-contain mb-1 ml-auto"
              />
            )}
            <p className="text-xs font-semibold text-gray-700">
              {issuerName || 'Program Name'}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Presented by
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
