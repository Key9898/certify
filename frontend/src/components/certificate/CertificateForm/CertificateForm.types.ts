import type { CreateCertificateDto } from '@/types';

export interface CertificateFormData {
  templateId: string;
  recipientName: string;
  recipientEmail: string;
  certificateTitle: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  issuerName: string;
  issuerSignature: string;
  organizationLogo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface CertificateFormProps {
  initialData?: Partial<CertificateFormData>;
  templateId: string;
  onSubmit: (data: CreateCertificateDto) => Promise<void>;
  onChange?: (data: Partial<CertificateFormData>) => void;
  isSubmitting?: boolean;
}
