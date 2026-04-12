import { Response, NextFunction, Request } from 'express';
import { nanoid } from 'nanoid';
import { Template } from '../models/Template';
import {
  Integration,
  type IIntegrationDocument,
  type IntegrationMode,
  type IntegrationProvider,
  type IntegrationStatus,
} from '../models/Integration';
import { AuthenticatedRequest } from '../types';
import { createBatchJob, processBatchJob } from '../services/batchService';
import {
  createCertificate,
  generateAndUploadPdf,
} from '../services/certificateService';
import {
  getWorkspaceMemberIds,
  isWorkspaceAdmin,
} from '../services/workspaceService';
import {
  INTEGRATION_CATALOG,
  buildBatchIntegrationRows,
  buildCanvasReturnContext,
  buildGoogleSheetsBatchSyncContext,
  buildGoogleSheetsSingleSyncContext,
  buildIntegrationSamplePayload,
  buildIntegrationWebhookUrl,
  buildSingleIntegrationRequest,
  resolveIntegrationTemplateId,
} from '../services/integrationService';
import {
  runNativeIntegrationChecks,
  syncQueuedGoogleSheetsBatch,
  syncSingleIntegrationNativeResult,
} from '../services/nativeIntegrationService';

const PROVIDERS = new Set<IntegrationProvider>(
  INTEGRATION_CATALOG.map((integration) => integration.provider)
);
const STATUSES = new Set<IntegrationStatus>(['active', 'paused']);
const MODES = new Set<IntegrationMode>(['single', 'batch']);
const MAX_BATCH_ROWS = 500;
const MAX_PAYLOAD_SIZE = 1024 * 1024;

type OptionalDefaults = Partial<IIntegrationDocument['defaults']>;
type OptionalSettings = Partial<IIntegrationDocument['settings']>;

const getTemplateIdValue = (integration: IIntegrationDocument): string => {
  const templateRef = integration.templateId as unknown as {
    _id?: { toString(): string };
    toString(): string;
  };

  if (templateRef && typeof templateRef === 'object' && templateRef._id) {
    return templateRef._id.toString();
  }

  return templateRef.toString();
};

const getBaseUrl = (req: Request): string =>
  (
    process.env.API_URL ||
    `${req.protocol}://${req.get('host') || 'localhost:3000'}`
  ).replace(/\/$/, '');

const requireWorkspaceAdmin = (
  req: AuthenticatedRequest,
  res: Response
): boolean => {
  if (!isWorkspaceAdmin(req.user!)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only workspace admins can manage integrations.',
      },
    });
    return false;
  }

  if (!req.user!.organizationId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'NO_WORKSPACE',
        message: 'No workspace is attached to this user.',
      },
    });
    return false;
  }

  return true;
};

const sanitizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : '';
};

const sanitizeOptionalBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const sanitizeGoogleSheetsSettings = (settings?: OptionalSettings) => ({
  enabled: sanitizeOptionalBoolean(settings?.googleSheets?.enabled) ?? false,
  spreadsheetId:
    sanitizeOptionalString(settings?.googleSheets?.spreadsheetId) || undefined,
  sheetName:
    sanitizeOptionalString(settings?.googleSheets?.sheetName) || undefined,
  statusColumn:
    sanitizeOptionalString(settings?.googleSheets?.statusColumn) || undefined,
  certificateIdColumn:
    sanitizeOptionalString(settings?.googleSheets?.certificateIdColumn) ||
    undefined,
  pdfUrlColumn:
    sanitizeOptionalString(settings?.googleSheets?.pdfUrlColumn) || undefined,
  batchJobIdColumn:
    sanitizeOptionalString(settings?.googleSheets?.batchJobIdColumn) ||
    undefined,
  processedAtColumn:
    sanitizeOptionalString(settings?.googleSheets?.processedAtColumn) ||
    undefined,
});

const sanitizeCanvasSettings = (settings?: OptionalSettings) => ({
  enabled: sanitizeOptionalBoolean(settings?.canvas?.enabled) ?? false,
  baseUrl: sanitizeOptionalString(settings?.canvas?.baseUrl) || undefined,
  courseId: sanitizeOptionalString(settings?.canvas?.courseId) || undefined,
  assignmentId:
    sanitizeOptionalString(settings?.canvas?.assignmentId) || undefined,
  moduleId: sanitizeOptionalString(settings?.canvas?.moduleId) || undefined,
  completionPreset: settings?.canvas?.completionPreset || 'course_completion',
  returnMode: settings?.canvas?.returnMode || 'response_only',
});

const assertAccessibleTemplate = async (
  templateId: string,
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!/^[a-f\d]{24}$/i.test(templateId)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TEMPLATE',
        message: 'Invalid templateId format.',
      },
    });
    return null;
  }

  const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
  const template = await Template.findOne({
    _id: templateId,
    $or: [{ isPublic: true }, { createdBy: { $in: workspaceUserIds } }],
  }).select('name');

  if (!template) {
    res.status(404).json({
      success: false,
      error: {
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found for this workspace.',
      },
    });
    return null;
  }

  return template;
};

const serializeIntegration = (
  integration: IIntegrationDocument,
  baseUrl: string,
  templateName?: string
) => ({
  _id: integration._id.toString(),
  name: integration.name,
  provider: integration.provider,
  description: integration.description,
  status: integration.status,
  mode: integration.mode,
  templateId: getTemplateIdValue(integration),
  templateName,
  webhookUrl: buildIntegrationWebhookUrl(baseUrl, integration.webhookKey),
  defaults: integration.defaults,
  settings: integration.settings,
  stats: {
    totalRuns: integration.stats.totalRuns,
    successRuns: integration.stats.successRuns,
    failedRuns: integration.stats.failedRuns,
    lastTriggeredAt: integration.stats.lastTriggeredAt,
    lastSuccessfulRunAt: integration.stats.lastSuccessfulRunAt,
    lastTestedAt: integration.stats.lastTestedAt,
    lastError: integration.stats.lastError,
  },
  createdAt: integration.createdAt,
  updatedAt: integration.updatedAt,
});

const markIntegrationFailure = async (
  integration: IIntegrationDocument,
  message: string
): Promise<void> => {
  integration.stats.totalRuns += 1;
  integration.stats.failedRuns += 1;
  integration.stats.lastTriggeredAt = new Date();
  integration.stats.lastError = message;
  await integration.save();
};

const markIntegrationSuccess = async (
  integration: IIntegrationDocument
): Promise<void> => {
  const now = new Date();
  integration.stats.totalRuns += 1;
  integration.stats.successRuns += 1;
  integration.stats.lastTriggeredAt = now;
  integration.stats.lastSuccessfulRunAt = now;
  integration.stats.lastError = undefined;
  await integration.save();
};

export const listIntegrationCatalog = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  res.json({ success: true, data: INTEGRATION_CATALOG });
};

export const listIntegrations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const integrations = await Integration.find({
      organizationId: req.user!.organizationId,
    })
      .populate('templateId', 'name')
      .sort({ createdAt: -1 });

    const baseUrl = getBaseUrl(req);

    res.json({
      success: true,
      data: integrations.map((integration) =>
        serializeIntegration(
          integration,
          baseUrl,
          typeof integration.templateId === 'object' &&
            'name' in integration.templateId
            ? (integration.templateId as { name: string }).name
            : undefined
        )
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const createIntegration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const {
      name,
      provider,
      description,
      status,
      mode,
      templateId,
      defaults,
      settings,
    } = req.body as {
      name?: string;
      provider?: IntegrationProvider;
      description?: string;
      status?: IntegrationStatus;
      mode?: IntegrationMode;
      templateId?: string;
      defaults?: OptionalDefaults;
      settings?: OptionalSettings;
    };

    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Integration name is required.',
        },
      });
      return;
    }

    if (!provider || !PROVIDERS.has(provider)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'A valid provider is required.',
        },
      });
      return;
    }

    if (!mode || !MODES.has(mode)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mode must be single or batch.',
        },
      });
      return;
    }

    if (!templateId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'templateId is required.' },
      });
      return;
    }

    const template = await assertAccessibleTemplate(templateId, req, res);
    if (!template) return;

    const integration = await Integration.create({
      organizationId: req.user!.organizationId,
      createdBy: req.user!._id,
      name: name.trim(),
      provider,
      description: description?.trim(),
      status: status && STATUSES.has(status) ? status : 'active',
      mode,
      templateId: template._id,
      defaults: {
        certificateTitle:
          sanitizeOptionalString(defaults?.certificateTitle) || undefined,
        description: sanitizeOptionalString(defaults?.description) || undefined,
        issuerName: sanitizeOptionalString(defaults?.issuerName) || undefined,
        issuerSignature:
          sanitizeOptionalString(defaults?.issuerSignature) || undefined,
        organizationLogo:
          sanitizeOptionalString(defaults?.organizationLogo) || undefined,
        primaryColor:
          sanitizeOptionalString(defaults?.primaryColor) || undefined,
        secondaryColor:
          sanitizeOptionalString(defaults?.secondaryColor) || undefined,
      },
      settings: {
        autoGeneratePdf: settings?.autoGeneratePdf ?? true,
        googleSheets: sanitizeGoogleSheetsSettings(settings),
        canvas: sanitizeCanvasSettings(settings),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...serializeIntegration(integration, getBaseUrl(req), template.name),
        samplePayload: buildIntegrationSamplePayload(
          integration,
          template.name
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateIntegration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const integration = await Integration.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
    }).populate('templateId', 'name');

    if (!integration) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration not found.' },
      });
      return;
    }

    const {
      name,
      provider,
      description,
      status,
      mode,
      templateId,
      defaults,
      settings,
      rotateWebhookKey,
    } = req.body as {
      name?: string;
      provider?: IntegrationProvider;
      description?: string;
      status?: IntegrationStatus;
      mode?: IntegrationMode;
      templateId?: string;
      defaults?: OptionalDefaults;
      settings?: OptionalSettings;
      rotateWebhookKey?: boolean;
    };

    let templateName =
      typeof integration.templateId === 'object' &&
      'name' in integration.templateId
        ? (integration.templateId as { name: string }).name
        : undefined;

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Integration name cannot be empty.',
          },
        });
        return;
      }
      integration.name = trimmed;
    }

    if (provider !== undefined) {
      if (!PROVIDERS.has(provider)) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid provider.' },
        });
        return;
      }
      integration.provider = provider;
    }

    if (description !== undefined) {
      integration.description = description.trim() || undefined;
    }

    if (status !== undefined) {
      if (!STATUSES.has(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status must be active or paused.',
          },
        });
        return;
      }
      integration.status = status;
    }

    if (mode !== undefined) {
      if (!MODES.has(mode)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Mode must be single or batch.',
          },
        });
        return;
      }
      integration.mode = mode;
    }

    if (templateId !== undefined) {
      const template = await assertAccessibleTemplate(templateId, req, res);
      if (!template) return;
      integration.templateId = template._id;
      templateName = template.name;
    }

    if (defaults) {
      if (defaults.certificateTitle !== undefined) {
        integration.defaults.certificateTitle =
          sanitizeOptionalString(defaults.certificateTitle) || undefined;
      }
      if (defaults.description !== undefined) {
        integration.defaults.description =
          sanitizeOptionalString(defaults.description) || undefined;
      }
      if (defaults.issuerName !== undefined) {
        integration.defaults.issuerName =
          sanitizeOptionalString(defaults.issuerName) || undefined;
      }
      if (defaults.issuerSignature !== undefined) {
        integration.defaults.issuerSignature =
          sanitizeOptionalString(defaults.issuerSignature) || undefined;
      }
      if (defaults.organizationLogo !== undefined) {
        integration.defaults.organizationLogo =
          sanitizeOptionalString(defaults.organizationLogo) || undefined;
      }
      if (defaults.primaryColor !== undefined) {
        integration.defaults.primaryColor =
          sanitizeOptionalString(defaults.primaryColor) || undefined;
      }
      if (defaults.secondaryColor !== undefined) {
        integration.defaults.secondaryColor =
          sanitizeOptionalString(defaults.secondaryColor) || undefined;
      }
    }

    if (settings?.autoGeneratePdf !== undefined) {
      integration.settings.autoGeneratePdf = settings.autoGeneratePdf;
    }

    if (settings?.googleSheets) {
      integration.settings.googleSheets =
        sanitizeGoogleSheetsSettings(settings);
    }

    if (settings?.canvas) {
      integration.settings.canvas = sanitizeCanvasSettings(settings);
    }

    if (rotateWebhookKey) {
      integration.webhookKey = `ig_${nanoid(32)}`;
    }

    await integration.save();

    res.json({
      success: true,
      data: {
        ...serializeIntegration(integration, getBaseUrl(req), templateName),
        samplePayload: buildIntegrationSamplePayload(integration, templateName),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIntegration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const deleted = await Integration.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
    });

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration not found.' },
      });
      return;
    }

    res.json({ success: true, data: { message: 'Integration removed.' } });
  } catch (error) {
    next(error);
  }
};

export const testIntegration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const integration = await Integration.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
    }).populate('templateId', 'name');

    if (!integration) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration not found.' },
      });
      return;
    }

    const templateName =
      typeof integration.templateId === 'object' &&
      'name' in integration.templateId
        ? (integration.templateId as { name: string }).name
        : undefined;
    const webhookUrl = buildIntegrationWebhookUrl(
      getBaseUrl(req),
      integration.webhookKey
    );
    const samplePayload = buildIntegrationSamplePayload(
      integration,
      templateName
    );
    const nativeChecks = await runNativeIntegrationChecks(integration);

    integration.stats.lastTestedAt = new Date();
    integration.stats.lastError = undefined;
    await integration.save();

    res.json({
      success: true,
      data: {
        connection: 'ready',
        webhookUrl,
        samplePayload,
        sampleCurl: `curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(samplePayload)}'`,
        notes: [
          'Send JSON to the webhook URL from your platform.',
          'Override templateId, certificateTitle, issuerName, or dates in each payload when needed.',
          integration.mode === 'batch'
            ? 'Use a data array to queue a background batch job.'
            : 'Single mode creates one certificate immediately and can auto-generate a PDF.',
        ],
        nativeChecks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getIntegrationHookInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const integration = await Integration.findOne({
      webhookKey: req.params.webhookKey,
    }).populate('templateId', 'name');

    if (!integration) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration webhook not found.' },
      });
      return;
    }

    if (integration.status !== 'active') {
      res.status(409).json({
        success: false,
        error: {
          code: 'INTEGRATION_PAUSED',
          message: 'This integration is currently paused.',
        },
      });
      return;
    }

    const templateName =
      typeof integration.templateId === 'object' &&
      'name' in integration.templateId
        ? (integration.templateId as { name: string }).name
        : undefined;

    res.json({
      success: true,
      data: {
        name: integration.name,
        provider: integration.provider,
        mode: integration.mode,
        webhookUrl: buildIntegrationWebhookUrl(
          getBaseUrl(req),
          integration.webhookKey
        ),
        samplePayload: buildIntegrationSamplePayload(integration, templateName),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const receiveIntegrationWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const integration = await Integration.findOne({
      webhookKey: req.params.webhookKey,
    });

    if (!integration) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration webhook not found.' },
      });
      return;
    }

    if (integration.status !== 'active') {
      res.status(409).json({
        success: false,
        error: {
          code: 'INTEGRATION_PAUSED',
          message: 'This integration is currently paused.',
        },
      });
      return;
    }

    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request body exceeds maximum size of 1MB.`,
        },
      });
      return;
    }

    try {
      if (integration.mode === 'batch') {
        const rows = buildBatchIntegrationRows(integration, req.body);

        if (!Array.isArray(rows) || rows.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Batch mode requires a non-empty data array.',
            },
          });
          return;
        }

        if (rows.length > MAX_BATCH_ROWS) {
          res.status(413).json({
            success: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: `Batch exceeds maximum of ${MAX_BATCH_ROWS} rows. Found ${rows.length} rows.`,
            },
          });
          return;
        }

        const templateId = resolveIntegrationTemplateId(integration, req.body);
        const googleSheetsContext = buildGoogleSheetsBatchSyncContext(
          integration,
          req.body
        );
        const job = await createBatchJob(
          templateId,
          rows,
          integration.createdBy.toString(),
          googleSheetsContext
            ? {
                integrationId: integration._id,
                provider: integration.provider,
                googleSheets: {
                  spreadsheetId: googleSheetsContext.spreadsheetId,
                  sheetName: googleSheetsContext.sheetName,
                  statusColumn: integration.settings.googleSheets?.statusColumn,
                  certificateIdColumn:
                    integration.settings.googleSheets?.certificateIdColumn,
                  pdfUrlColumn: integration.settings.googleSheets?.pdfUrlColumn,
                  batchJobIdColumn:
                    integration.settings.googleSheets?.batchJobIdColumn,
                  processedAtColumn:
                    integration.settings.googleSheets?.processedAtColumn,
                  rows: googleSheetsContext.rows,
                },
              }
            : undefined
        );

        processBatchJob(job._id.toString()).catch((error) => {
          console.error('Integration batch processing error:', error);
        });

        let nativeSyncStatus: 'queued' | 'skipped' | 'failed' =
          googleSheetsContext ? 'queued' : 'skipped';
        let nativeSyncMessage: string | undefined;

        if (googleSheetsContext) {
          try {
            await syncQueuedGoogleSheetsBatch(
              integration,
              {
                ...googleSheetsContext,
                statusColumn: integration.settings.googleSheets?.statusColumn,
                certificateIdColumn:
                  integration.settings.googleSheets?.certificateIdColumn,
                pdfUrlColumn: integration.settings.googleSheets?.pdfUrlColumn,
                batchJobIdColumn:
                  integration.settings.googleSheets?.batchJobIdColumn,
                processedAtColumn:
                  integration.settings.googleSheets?.processedAtColumn,
              },
              job._id.toString()
            );
          } catch (syncError) {
            nativeSyncStatus = 'failed';
            nativeSyncMessage =
              syncError instanceof Error
                ? syncError.message
                : 'Failed to queue Google Sheets write-back.';
            console.warn('Google Sheets queued write-back failed:', syncError);
          }
        }

        await markIntegrationSuccess(integration);

        res.status(202).json({
          success: true,
          data: {
            mode: 'batch',
            batchJobId: job._id.toString(),
            totalRows: rows.length,
            status: job.status,
            nativeSyncStatus,
            nativeSyncMessage,
          },
        });
        return;
      }

      const certificateInput = buildSingleIntegrationRequest(
        integration,
        req.body
      );
      const googleSheetsContext = buildGoogleSheetsSingleSyncContext(
        integration,
        req.body
      );
      const canvasReturnContext = buildCanvasReturnContext(
        integration,
        req.body
      );
      const certificate = await createCertificate(
        certificateInput,
        integration.createdBy.toString()
      );

      let pdfUrl: string | undefined;
      if (integration.settings.autoGeneratePdf) {
        pdfUrl = await generateAndUploadPdf(
          certificate._id.toString(),
          integration.createdBy.toString()
        );
      }

      let nativeSyncStatus: 'synced' | 'skipped' | 'failed' =
        googleSheetsContext || canvasReturnContext ? 'synced' : 'skipped';
      let nativeSyncMessage: string | undefined;

      if (googleSheetsContext || canvasReturnContext) {
        try {
          await syncSingleIntegrationNativeResult({
            integration,
            publicCertificateId: certificate.certificateId,
            recipientName: certificate.recipientName,
            certificateTitle: certificate.certificateTitle,
            pdfUrl,
            googleSheets: googleSheetsContext,
            canvas: canvasReturnContext,
          });
        } catch (syncError) {
          nativeSyncStatus = 'failed';
          nativeSyncMessage =
            syncError instanceof Error
              ? syncError.message
              : 'Failed to complete the native provider callback.';
          console.warn('Native integration sync failed:', syncError);
        }
      }

      await markIntegrationSuccess(integration);

      res.status(201).json({
        success: true,
        data: {
          mode: 'single',
          certificateId: certificate._id.toString(),
          publicCertificateId: certificate.certificateId,
          pdfUrl,
          nativeSyncStatus,
          nativeSyncMessage,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Integration processing failed.';
      await markIntegrationFailure(integration, message);

      const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as { statusCode: unknown }).statusCode === 'number'
          ? (error as { statusCode: number }).statusCode
          : 400;

      res.status(statusCode).json({
        success: false,
        error: {
          code: 'INTEGRATION_FAILED',
          message,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
