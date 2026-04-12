import type { IntegrationProvider } from '@/types/integration';

export type IntegrationTabId = 'overview' | 'create' | 'manage' | 'docs';

export interface IntegrationTab {
  id: IntegrationTabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export interface IntegrationStats {
  total: number;
  active: number;
  paused: number;
  totalRuns: number;
}

export interface IntegrationFormData {
  name: string;
  provider: IntegrationProvider;
  description: string;
  status: 'active' | 'paused';
  mode: 'single' | 'batch';
  templateId: string;
  certificateTitle: string;
  issuerName: string;
  descriptionDefault: string;
  autoGeneratePdf: boolean;
  googleSheetsEnabled: boolean;
  googleSheetsSpreadsheetId: string;
  googleSheetsSheetName: string;
  googleSheetsStatusColumn: string;
  googleSheetsCertificateIdColumn: string;
  googleSheetsPdfUrlColumn: string;
  googleSheetsBatchJobIdColumn: string;
  googleSheetsProcessedAtColumn: string;
  canvasEnabled: boolean;
  canvasBaseUrl: string;
  canvasCourseId: string;
  canvasAssignmentId: string;
  canvasModuleId: string;
  canvasCompletionPreset:
    | 'course_completion'
    | 'module_completion'
    | 'capstone_completion';
  canvasReturnMode: 'response_only' | 'submission_comment';
}

export interface FormFieldConfig {
  name: keyof IntegrationFormData;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
  options?: { value: string; label: string }[];
  conditional?: {
    field: keyof IntegrationFormData;
    value: string | boolean;
  };
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  fields: FormFieldConfig[];
}
