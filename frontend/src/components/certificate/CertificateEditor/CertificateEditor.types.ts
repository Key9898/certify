import type { Template } from '@/types';
import type { CertificateFormData } from '../CertificateForm/CertificateForm.types';

export interface CertificateEditorProps {
  template: Template;
  onComplete: (data: CertificateFormData) => Promise<void> | void;
  isSubmitting?: boolean;
}
