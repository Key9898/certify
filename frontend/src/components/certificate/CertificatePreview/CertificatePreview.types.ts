export interface PreviewData {
  recipientName: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface CertificatePreviewProps {
  data: PreviewData;
  templateName?: string;
}
