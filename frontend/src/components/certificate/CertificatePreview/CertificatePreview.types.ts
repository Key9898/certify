import type { Template } from '@/types';

export interface PreviewData {
  recipientName: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  certificateId?: string;
}

export interface CertificatePreviewProps {
  data: PreviewData;
  template?: Template;
  templateName?: string;
}
