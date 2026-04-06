import type { Certificate } from '@/types';

export interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificate: Certificate) => void;
  onDelete?: (certificate: Certificate) => void;
  isGeneratingPdf?: boolean;
}
