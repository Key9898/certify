import type { Template } from './template';

export type IntegrationProvider = 'google_sheets' | 'canvas' | 'custom';

export type IntegrationMode = 'single' | 'batch';
export type IntegrationStatus = 'active' | 'paused';
export type CanvasCompletionPreset =
  | 'course_completion'
  | 'module_completion'
  | 'capstone_completion';
export type CanvasReturnMode = 'response_only' | 'submission_comment';

export interface IntegrationDefaults {
  certificateTitle?: string;
  description?: string;
  issuerName?: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface GoogleSheetsIntegrationSettings {
  enabled?: boolean;
  spreadsheetId?: string;
  sheetName?: string;
  statusColumn?: string;
  certificateIdColumn?: string;
  pdfUrlColumn?: string;
  batchJobIdColumn?: string;
  processedAtColumn?: string;
}

export interface CanvasIntegrationSettings {
  enabled?: boolean;
  baseUrl?: string;
  courseId?: string;
  assignmentId?: string;
  moduleId?: string;
  completionPreset?: CanvasCompletionPreset;
  returnMode?: CanvasReturnMode;
}

export interface IntegrationSettings {
  autoGeneratePdf: boolean;
  googleSheets?: GoogleSheetsIntegrationSettings;
  canvas?: CanvasIntegrationSettings;
}

export interface IntegrationStats {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  lastTriggeredAt?: string;
  lastSuccessfulRunAt?: string;
  lastTestedAt?: string;
  lastError?: string;
}

export interface IntegrationCatalogItem {
  provider: IntegrationProvider;
  label: string;
  category: 'automation' | 'spreadsheet' | 'lms' | 'custom';
  summary: string;
  recommendedMode: IntegrationMode;
  highlights: string[];
}

export interface IntegrationGuideStep {
  title: string;
  description: string;
}

export interface IntegrationFieldMapping {
  source: string;
  target: string;
  example: string;
}

export interface IntegrationRecipe {
  id: string;
  name: string;
  summary: string;
  mode: IntegrationMode;
  recommendedTemplateCategory: Template['category'];
  templateHint: string;
  keywords: string[];
  certificateTitle: string;
  issuerName: string;
  description: string;
  automationHint: string;
}

export interface IntegrationProviderGuide {
  provider: IntegrationProvider;
  headline: string;
  setupLead: string;
  idealFor: string[];
  onboardingChecklist: string[];
  setupSteps: IntegrationGuideStep[];
  fieldMappings: IntegrationFieldMapping[];
  recipes: IntegrationRecipe[];
  qaChecks: string[];
}

export interface Integration {
  _id: string;
  name: string;
  provider: IntegrationProvider;
  description?: string;
  status: IntegrationStatus;
  mode: IntegrationMode;
  templateId: string;
  templateName?: string;
  webhookUrl: string;
  defaults: IntegrationDefaults;
  settings: IntegrationSettings;
  stats: IntegrationStats;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationTestResult {
  connection: string;
  webhookUrl: string;
  samplePayload: Record<string, unknown>;
  sampleCurl: string;
  notes: string[];
  nativeChecks?: IntegrationNativeCheck[];
}

export interface IntegrationNativeCheck {
  label: string;
  status: 'configured' | 'missing' | 'failed';
  detail: string;
}

export interface CreateIntegrationDto {
  name: string;
  provider: IntegrationProvider;
  description?: string;
  status?: IntegrationStatus;
  mode: IntegrationMode;
  templateId: string;
  defaults?: IntegrationDefaults;
  settings?: IntegrationSettings;
}

export interface UpdateIntegrationDto extends Partial<CreateIntegrationDto> {
  rotateWebhookKey?: boolean;
}
