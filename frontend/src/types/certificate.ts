export interface Certificate {
  _id: string;
  templateId: string | Template;
  recipientName: string;
  recipientEmail?: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  customFields?: {
    primaryColor?: string;
    secondaryColor?: string;
    [key: string]: unknown;
  };
  pdfUrl?: string;
  certificateId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateDto {
  templateId: string;
  recipientName: string;
  recipientEmail?: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  customFields?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export type Template = import('./template').Template;
