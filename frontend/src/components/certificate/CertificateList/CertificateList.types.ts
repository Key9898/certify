import type { Certificate } from '@/types';

export interface CertificateListProps {
  certificates: Certificate[];
  isLoading?: boolean;
  onDownload?: (certificate: Certificate) => void;
  onDelete?: (certificate: Certificate) => void;
  generatingPdfId?: string | null;
}
