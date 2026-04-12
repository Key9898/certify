import type {
  IBatchJobDocument,
  IBatchResult,
  IGoogleSheetsBatchSyncContext,
} from '../models/BatchJob';
import type { IIntegrationDocument } from '../models/Integration';
import {
  buildCanvasCertificateMessage,
  postCanvasSubmissionComment,
  resolveCanvasConfig,
  testCanvasConnection,
} from './canvasService';
import {
  resolveGoogleSheetsConfig,
  syncGoogleSheetsRows,
  testGoogleSheetsConnection,
  type GoogleSheetsResolvedConfig,
  type GoogleSheetsRowUpdate,
} from './googleSheetsService';

export interface NativeIntegrationCheck {
  label: string;
  status: 'configured' | 'missing' | 'failed';
  detail: string;
}

export interface GoogleSheetsSingleSyncContext {
  rowNumber: number;
  spreadsheetId?: string;
  sheetName?: string;
}

export interface CanvasReturnContext {
  userId?: string;
  courseId?: string;
  assignmentId?: string;
}

const buildGoogleSheetsContext = (
  baseConfig: GoogleSheetsResolvedConfig,
  overrides?: {
    spreadsheetId?: string;
    sheetName?: string;
  }
): GoogleSheetsResolvedConfig => ({
  ...baseConfig,
  spreadsheetId: overrides?.spreadsheetId || baseConfig.spreadsheetId,
  sheetName: overrides?.sheetName || baseConfig.sheetName,
});

const buildProcessedAt = (): string => new Date().toISOString();

export const runNativeIntegrationChecks = async (
  integration: IIntegrationDocument
): Promise<NativeIntegrationCheck[]> => {
  if (integration.provider === 'google_sheets') {
    const config = resolveGoogleSheetsConfig(integration.settings.googleSheets);

    if (!config) {
      return [
        {
          label: 'Google Sheets sync',
          status: 'missing',
          detail:
            'Add spreadsheet details on the integration and set GOOGLE_SERVICE_ACCOUNT_EMAIL plus GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY on the backend.',
        },
      ];
    }

    try {
      const result = await testGoogleSheetsConnection(config);
      return [
        {
          label: 'Google Sheets sync',
          status: 'configured',
          detail: `Connected to ${result.sheetName} with ${result.headerCount} detected headers.`,
        },
      ];
    } catch (error) {
      return [
        {
          label: 'Google Sheets sync',
          status: 'failed',
          detail:
            error instanceof Error
              ? error.message
              : 'Failed to validate the Google Sheets connection.',
        },
      ];
    }
  }

  if (integration.provider === 'canvas') {
    const config = resolveCanvasConfig(integration.settings.canvas);

    if (!config) {
      return [
        {
          label: 'Canvas API handoff',
          status: 'missing',
          detail:
            'Add base URL and course details on the integration and set CANVAS_API_TOKEN on the backend to enable native Canvas callbacks.',
        },
      ];
    }

    try {
      const result = await testCanvasConnection(config);
      return [
        {
          label: 'Canvas API handoff',
          status: 'configured',
          detail: `Connected to Canvas course ${result.courseName}${result.courseCode ? ` (${result.courseCode})` : ''}.`,
        },
      ];
    } catch (error) {
      return [
        {
          label: 'Canvas API handoff',
          status: 'failed',
          detail:
            error instanceof Error
              ? error.message
              : 'Failed to validate the Canvas course connection.',
        },
      ];
    }
  }

  return [
    {
      label: 'Webhook-only flow',
      status: 'configured',
      detail:
        'This provider uses the webhook contract only and does not require native connector credentials.',
    },
  ];
};

export const syncQueuedGoogleSheetsBatch = async (
  integration: IIntegrationDocument,
  context: IGoogleSheetsBatchSyncContext,
  batchJobId: string
): Promise<void> => {
  const baseConfig = resolveGoogleSheetsConfig({
    ...integration.settings.googleSheets,
    spreadsheetId: context.spreadsheetId,
    sheetName: context.sheetName,
    statusColumn:
      context.statusColumn || integration.settings.googleSheets?.statusColumn,
    certificateIdColumn:
      context.certificateIdColumn ||
      integration.settings.googleSheets?.certificateIdColumn,
    pdfUrlColumn:
      context.pdfUrlColumn || integration.settings.googleSheets?.pdfUrlColumn,
    batchJobIdColumn:
      context.batchJobIdColumn ||
      integration.settings.googleSheets?.batchJobIdColumn,
    processedAtColumn:
      context.processedAtColumn ||
      integration.settings.googleSheets?.processedAtColumn,
    enabled: true,
  });

  if (!baseConfig) {
    return;
  }

  const rowUpdates: GoogleSheetsRowUpdate[] = context.rows.map((row) => ({
    rowNumber: row.rowNumber,
    status: 'Queued',
    batchJobId,
  }));

  await syncGoogleSheetsRows(baseConfig, rowUpdates);
};

const buildGoogleSheetsResultRows = (
  context: IGoogleSheetsBatchSyncContext,
  results: IBatchResult[]
): GoogleSheetsRowUpdate[] =>
  context.rows.map((row, index) => {
    const result = results[index];

    if (!result) {
      return {
        rowNumber: row.rowNumber,
        status: 'Missing result',
        processedAt: buildProcessedAt(),
      };
    }

    return {
      rowNumber: row.rowNumber,
      status: result.status === 'success' ? 'Created' : 'Failed',
      certificateId: result.publicCertificateId,
      pdfUrl: result.pdfUrl,
      processedAt: buildProcessedAt(),
    };
  });

export const syncBatchJobNativeResults = async (
  job: IBatchJobDocument
): Promise<void> => {
  if (
    job.integrationContext?.provider !== 'google_sheets' ||
    !job.integrationContext.googleSheets
  ) {
    return;
  }

  const baseConfig = resolveGoogleSheetsConfig({
    enabled: true,
    spreadsheetId: job.integrationContext.googleSheets.spreadsheetId,
    sheetName: job.integrationContext.googleSheets.sheetName,
    statusColumn: job.integrationContext.googleSheets.statusColumn,
    certificateIdColumn:
      job.integrationContext.googleSheets.certificateIdColumn,
    pdfUrlColumn: job.integrationContext.googleSheets.pdfUrlColumn,
    batchJobIdColumn: job.integrationContext.googleSheets.batchJobIdColumn,
    processedAtColumn: job.integrationContext.googleSheets.processedAtColumn,
  });

  if (!baseConfig) {
    return;
  }

  await syncGoogleSheetsRows(
    buildGoogleSheetsContext(baseConfig),
    buildGoogleSheetsResultRows(
      job.integrationContext.googleSheets,
      job.results
    )
  );
};

export const syncSingleIntegrationNativeResult = async ({
  integration,
  publicCertificateId,
  recipientName,
  certificateTitle,
  pdfUrl,
  googleSheets,
  canvas,
}: {
  integration: IIntegrationDocument;
  publicCertificateId: string;
  recipientName: string;
  certificateTitle: string;
  pdfUrl?: string;
  googleSheets?: GoogleSheetsSingleSyncContext | null;
  canvas?: CanvasReturnContext | null;
}): Promise<void> => {
  if (integration.provider === 'google_sheets' && googleSheets) {
    const baseConfig = resolveGoogleSheetsConfig({
      ...integration.settings.googleSheets,
      spreadsheetId:
        googleSheets.spreadsheetId ||
        integration.settings.googleSheets?.spreadsheetId,
      sheetName:
        googleSheets.sheetName || integration.settings.googleSheets?.sheetName,
      enabled: true,
    });

    if (baseConfig) {
      await syncGoogleSheetsRows(baseConfig, [
        {
          rowNumber: googleSheets.rowNumber,
          status: 'Created',
          certificateId: publicCertificateId,
          pdfUrl,
          processedAt: buildProcessedAt(),
        },
      ]);
    }
  }

  if (integration.provider === 'canvas') {
    const baseConfig = resolveCanvasConfig({
      ...integration.settings.canvas,
      courseId: canvas?.courseId || integration.settings.canvas?.courseId,
      assignmentId:
        canvas?.assignmentId || integration.settings.canvas?.assignmentId,
      enabled: true,
    });

    if (
      baseConfig &&
      baseConfig.returnMode === 'submission_comment' &&
      canvas?.userId
    ) {
      const message = buildCanvasCertificateMessage({
        recipientName,
        certificateTitle,
        publicCertificateId,
        pdfUrl,
      });

      await postCanvasSubmissionComment(baseConfig, {
        userId: canvas.userId,
        assignmentId: canvas.assignmentId,
        courseId: canvas.courseId,
        message,
      });
    }
  }
};
