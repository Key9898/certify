import type { IIntegrationDocument, IntegrationProvider } from '../models/Integration';
import type { CreateCertificateDto } from './certificateService';

export interface IntegrationCatalogItem {
  provider: IntegrationProvider;
  label: string;
  category: 'automation' | 'spreadsheet' | 'lms' | 'custom';
  summary: string;
  recommendedMode: 'single' | 'batch';
  highlights: string[];
}

export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    provider: 'google_sheets',
    label: 'Google Sheets',
    category: 'spreadsheet',
    summary:
      'Turn spreadsheet rows into certificates with Apps Script plus native status write-back through the Google Sheets API.',
    recommendedMode: 'batch',
    highlights: ['Spreadsheet source of truth', 'Apps Script starter', 'Native row write-back'],
  },
  {
    provider: 'canvas',
    label: 'Canvas',
    category: 'lms',
    summary:
      'Connect course outcomes and student milestones to certificate delivery with a native Canvas callback option.',
    recommendedMode: 'single',
    highlights: ['Assignment milestones', 'Submission comment return', 'Institution branding'],
  },
  {
    provider: 'custom',
    label: 'Custom Webhook',
    category: 'custom',
    summary: 'Integrate any platform that can send JSON over HTTPS.',
    recommendedMode: 'single',
    highlights: ['Portable payload contract', 'Works with internal tools', 'Flexible field overrides'],
  },
];


const DEFAULT_CERTIFICATE_TITLE = 'Certificate of Achievement';
const DEFAULT_ISSUER_NAME = 'Certify';

type LooseRecord = Record<string, unknown>;

export interface GoogleSheetsBatchSyncContext {
  spreadsheetId: string;
  sheetName: string;
  rows: Array<{
    rowNumber: number;
    recipientName: string;
  }>;
}

export interface GoogleSheetsSingleSyncContext {
  spreadsheetId?: string;
  sheetName?: string;
  rowNumber: number;
}

export interface CanvasReturnContext {
  userId?: string;
  courseId?: string;
  assignmentId?: string;
}

const createValidationError = (message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = 400;
  return error;
};

const asRecord = (value: unknown): LooseRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as LooseRecord;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asIsoString = (value: unknown, fallback?: string): string => {
  const direct = asString(value);
  if (!direct) {
    return fallback || new Date().toISOString();
  }

  const date = new Date(direct);
  if (Number.isNaN(date.getTime())) {
    return fallback || new Date().toISOString();
  }

  return date.toISOString();
};

const asPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  const asTrimmedString = asString(value);
  if (!asTrimmedString) {
    return undefined;
  }

  const parsed = Number.parseInt(asTrimmedString, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const extractColors = (
  payload: LooseRecord,
  integration: IIntegrationDocument
): Record<string, unknown> | undefined => {
  const primaryColor = asString(payload.primaryColor) || integration.defaults.primaryColor;
  const secondaryColor = asString(payload.secondaryColor) || integration.defaults.secondaryColor;

  if (!primaryColor && !secondaryColor) {
    return undefined;
  }

  return {
    ...(primaryColor ? { primaryColor } : {}),
    ...(secondaryColor ? { secondaryColor } : {}),
  };
};

export const resolveIntegrationTemplateId = (
  integration: IIntegrationDocument,
  payload: unknown
): string => {
  const record = asRecord(payload);
  return asString(record?.templateId) || integration.templateId.toString();
};

export const buildIntegrationWebhookUrl = (baseUrl: string, webhookKey: string): string =>
  `${baseUrl.replace(/\/$/, '')}/api/integrations/hooks/${webhookKey}`;

export const buildIntegrationSamplePayload = (
  integration: IIntegrationDocument,
  templateName?: string
): Record<string, unknown> => {
  const templateRef = integration.templateId as unknown as {
    _id?: { toString(): string };
    toString(): string;
  };
  const templateId = templateRef && typeof templateRef === 'object' && templateRef._id
    ? templateRef._id.toString()
    : templateRef?.toString();

  if (integration.mode === 'batch') {
    const batchPayload: Record<string, unknown> = {
      mode: 'batch',
      templateId,
      templateName,
      data: [
        {
          recipientName: 'Ava Morgan',
          recipientEmail: 'ava@example.com',
          certificateTitle: integration.defaults.certificateTitle || DEFAULT_CERTIFICATE_TITLE,
          issuerName: integration.defaults.issuerName || DEFAULT_ISSUER_NAME,
          issueDate: new Date().toISOString(),
          ...(integration.provider === 'google_sheets' ? { sheetRowNumber: 2 } : {}),
        },
        {
          recipientName: 'Noah Bennett',
          recipientEmail: 'noah@example.com',
          certificateTitle: integration.defaults.certificateTitle || DEFAULT_CERTIFICATE_TITLE,
          issuerName: integration.defaults.issuerName || DEFAULT_ISSUER_NAME,
          issueDate: new Date().toISOString(),
          ...(integration.provider === 'google_sheets' ? { sheetRowNumber: 3 } : {}),
        },
      ],
    };

    if (integration.provider === 'google_sheets') {
      batchPayload.spreadsheetId =
        integration.settings.googleSheets?.spreadsheetId || 'your-google-sheet-id';
      batchPayload.sheetName =
        integration.settings.googleSheets?.sheetName || 'Ready to Issue';
    }

    return batchPayload;
  }

  const singlePayload: Record<string, unknown> = {
    templateId,
    templateName,
    recipientName: 'Ava Morgan',
    recipientEmail: 'ava@example.com',
    certificateTitle: integration.defaults.certificateTitle || DEFAULT_CERTIFICATE_TITLE,
    issuerName: integration.defaults.issuerName || DEFAULT_ISSUER_NAME,
    description: integration.defaults.description || 'Awarded for outstanding performance.',
    issueDate: new Date().toISOString(),
  };

  if (integration.provider === 'google_sheets') {
    singlePayload.sheetRowNumber = 2;
    singlePayload.spreadsheetId =
      integration.settings.googleSheets?.spreadsheetId || 'your-google-sheet-id';
    singlePayload.sheetName =
      integration.settings.googleSheets?.sheetName || 'Ready to Issue';
  }

  if (integration.provider === 'canvas') {
    singlePayload.canvasUserId = '12345';
    singlePayload.canvasCourseId =
      integration.settings.canvas?.courseId || 'canvas-course-id';
    singlePayload.canvasAssignmentId =
      integration.settings.canvas?.assignmentId || 'canvas-assignment-id';
  }

  return singlePayload;
};

export const buildSingleIntegrationRequest = (
  integration: IIntegrationDocument,
  payload: unknown
): CreateCertificateDto => {
  const record = asRecord(payload);
  if (!record) {
    throw createValidationError('Request body must be a JSON object.');
  }

  const recipientName = asString(record.recipientName);
  if (!recipientName) {
    throw createValidationError('recipientName is required.');
  }

  const issueDate = new Date(asIsoString(record.issueDate));
  const expiryDateString = asString(record.expiryDate);
  const colors = extractColors(record, integration);
  const customFields = {
    ...(asRecord(record.customFields) || {}),
    ...(colors || {}),
  };

  return {
    templateId: asString(record.templateId) || integration.templateId.toString(),
    recipientName,
    recipientEmail: asString(record.recipientEmail),
    certificateTitle:
      asString(record.certificateTitle) ||
      integration.defaults.certificateTitle ||
      DEFAULT_CERTIFICATE_TITLE,
    description: asString(record.description) || integration.defaults.description,
    issueDate,
    expiryDate: expiryDateString ? new Date(asIsoString(expiryDateString)) : undefined,
    issuerName: asString(record.issuerName) || integration.defaults.issuerName || DEFAULT_ISSUER_NAME,
    issuerSignature:
      asString(record.issuerSignature) || integration.defaults.issuerSignature,
    organizationLogo:
      asString(record.organizationLogo) || integration.defaults.organizationLogo,
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
  };
};

export const buildBatchIntegrationRows = (
  integration: IIntegrationDocument,
  payload: unknown
): Record<string, string>[] => {
  const record = asRecord(payload);
  if (!record) {
    throw createValidationError('Request body must be a JSON object.');
  }

  const rawRows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.recipients)
      ? record.recipients
      : null;

  if (!rawRows || rawRows.length === 0) {
    throw createValidationError('Batch integrations require a non-empty data array.');
  }

  return rawRows.map((row, index) => {
    const rowRecord = asRecord(row);
    if (!rowRecord) {
      throw createValidationError(`Row ${index + 1} must be an object.`);
    }

    const recipientName = asString(rowRecord.recipientName);
    if (!recipientName) {
      throw createValidationError(`Row ${index + 1} is missing recipientName.`);
    }

    return {
      recipientName,
      recipientEmail: asString(rowRecord.recipientEmail) || '',
      certificateTitle:
        asString(rowRecord.certificateTitle) ||
        integration.defaults.certificateTitle ||
        DEFAULT_CERTIFICATE_TITLE,
      description: asString(rowRecord.description) || integration.defaults.description || '',
      issueDate: asIsoString(rowRecord.issueDate),
      expiryDate: asString(rowRecord.expiryDate)
        ? asIsoString(rowRecord.expiryDate)
        : '',
      issuerName:
        asString(rowRecord.issuerName) ||
        integration.defaults.issuerName ||
        DEFAULT_ISSUER_NAME,
    };
  });
};

export const buildGoogleSheetsBatchSyncContext = (
  integration: IIntegrationDocument,
  payload: unknown
): GoogleSheetsBatchSyncContext | null => {
  if (integration.provider !== 'google_sheets') {
    return null;
  }

  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  const rawRows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.recipients)
      ? record.recipients
      : null;

  if (!rawRows || rawRows.length === 0) {
    return null;
  }

  const spreadsheetId =
    asString(record.spreadsheetId) || integration.settings.googleSheets?.spreadsheetId;
  const sheetName =
    asString(record.sheetName) || integration.settings.googleSheets?.sheetName;

  if (!spreadsheetId || !sheetName) {
    return null;
  }

  const rows = rawRows.flatMap((row, index) => {
    const rowRecord = asRecord(row);
    const rowNumber = asPositiveInteger(
      rowRecord?.sheetRowNumber ?? rowRecord?.rowNumber ?? rowRecord?.sheetRow
    );

    if (!rowRecord || !rowNumber) {
      return [];
    }

    return [
      {
        rowNumber,
        recipientName: asString(rowRecord.recipientName) || `Row ${index + 1}`,
      },
    ];
  });

  if (rows.length === 0) {
    return null;
  }

  return {
    spreadsheetId,
    sheetName,
    rows,
  };
};

export const buildGoogleSheetsSingleSyncContext = (
  integration: IIntegrationDocument,
  payload: unknown
): GoogleSheetsSingleSyncContext | null => {
  if (integration.provider !== 'google_sheets') {
    return null;
  }

  const record = asRecord(payload);
  const rowNumber = asPositiveInteger(
    record?.sheetRowNumber ?? record?.rowNumber ?? record?.sheetRow
  );

  if (!record || !rowNumber) {
    return null;
  }

  return {
    rowNumber,
    spreadsheetId:
      asString(record.spreadsheetId) || integration.settings.googleSheets?.spreadsheetId,
    sheetName: asString(record.sheetName) || integration.settings.googleSheets?.sheetName,
  };
};

export const buildCanvasReturnContext = (
  integration: IIntegrationDocument,
  payload: unknown
): CanvasReturnContext | null => {
  if (integration.provider !== 'canvas') {
    return null;
  }

  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  return {
    userId:
      asString(record.canvasUserId) ||
      asString(record.userId) ||
      asString(record.studentId),
    courseId:
      asString(record.canvasCourseId) ||
      asString(record.courseId) ||
      integration.settings.canvas?.courseId,
    assignmentId:
      asString(record.canvasAssignmentId) ||
      asString(record.assignmentId) ||
      integration.settings.canvas?.assignmentId,
  };
};
