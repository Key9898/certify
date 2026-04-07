import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  FileText,
  Globe,
  Pause,
  Play,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Webhook,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDemo } from '@/context/DemoContext';
import { useTemplates } from '@/hooks/useTemplates';
import { INTEGRATION_CATALOG } from '@/utils/integrationCatalog';
import {
  findBestTemplateForRecipe,
  getIntegrationGuide,
} from '@/utils/integrationGuides';
import {
  buildCanvasPayloadSnippet,
  buildCertificateReturnSnippet,
  buildGoogleSheetsStarterSnippet,
  FALLBACK_INTEGRATION_PROVIDERS,
  getIntegrationSpotlight,
  GOOGLE_SHEETS_DEFAULT_MAPPING,
  PRIMARY_INTEGRATION_PROVIDERS,
} from '@/utils/integrationSpotlights';
import {
  createIntegration,
  deleteIntegration,
  fetchIntegrationCatalog,
  fetchIntegrations,
  testIntegration,
  updateIntegration,
} from '@/utils/integrationApi';
import { ROUTES } from '@/utils/constants';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';
import type {
  CanvasCompletionPreset,
  CanvasReturnMode,
  CreateIntegrationDto,
  Integration,
  IntegrationCatalogItem,
  IntegrationMode,
  IntegrationProvider,
  IntegrationRecipe,
  IntegrationStatus,
  IntegrationTestResult,
  Template,
} from '@/types';

interface IntegrationFormState {
  name: string;
  provider: IntegrationProvider;
  description: string;
  status: IntegrationStatus;
  mode: IntegrationMode;
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
  canvasCompletionPreset: CanvasCompletionPreset;
  canvasReturnMode: CanvasReturnMode;
}

const createInitialForm = (templateId = ''): IntegrationFormState => ({
  name: '',
  provider: 'google_sheets',
  description: '',
  status: 'active',
  mode: 'batch',
  templateId,
  certificateTitle: '',
  issuerName: '',
  descriptionDefault: '',
  autoGeneratePdf: false,
  googleSheetsEnabled: true,
  googleSheetsSpreadsheetId: '',
  googleSheetsSheetName: 'Ready to Issue',
  googleSheetsStatusColumn: GOOGLE_SHEETS_DEFAULT_MAPPING.statusColumn,
  googleSheetsCertificateIdColumn: GOOGLE_SHEETS_DEFAULT_MAPPING.certificateIdColumn,
  googleSheetsPdfUrlColumn: GOOGLE_SHEETS_DEFAULT_MAPPING.pdfUrlColumn,
  googleSheetsBatchJobIdColumn: 'Certify Batch ID',
  googleSheetsProcessedAtColumn: 'Processed At',
  canvasEnabled: false,
  canvasBaseUrl: '',
  canvasCourseId: '',
  canvasAssignmentId: '',
  canvasModuleId: '',
  canvasCompletionPreset: 'course_completion',
  canvasReturnMode: 'submission_comment',
});

const buildPayloadFromForm = (form: IntegrationFormState): CreateIntegrationDto => ({
  name: form.name.trim(),
  provider: form.provider,
  description: form.description.trim(),
  status: form.status,
  mode: form.mode,
  templateId: form.templateId,
  defaults: {
    certificateTitle: form.certificateTitle.trim() || undefined,
    issuerName: form.issuerName.trim() || undefined,
    description: form.descriptionDefault.trim() || undefined,
  },
  settings: {
    autoGeneratePdf: form.autoGeneratePdf,
    googleSheets: {
      enabled: form.provider === 'google_sheets' ? form.googleSheetsEnabled : false,
      spreadsheetId: form.googleSheetsSpreadsheetId.trim() || undefined,
      sheetName: form.googleSheetsSheetName.trim() || undefined,
      statusColumn: form.googleSheetsStatusColumn.trim() || undefined,
      certificateIdColumn:
        form.googleSheetsCertificateIdColumn.trim() || undefined,
      pdfUrlColumn: form.googleSheetsPdfUrlColumn.trim() || undefined,
      batchJobIdColumn: form.googleSheetsBatchJobIdColumn.trim() || undefined,
      processedAtColumn: form.googleSheetsProcessedAtColumn.trim() || undefined,
    },
    canvas: {
      enabled: form.provider === 'canvas' ? form.canvasEnabled : false,
      baseUrl: form.canvasBaseUrl.trim() || undefined,
      courseId: form.canvasCourseId.trim() || undefined,
      assignmentId: form.canvasAssignmentId.trim() || undefined,
      moduleId: form.canvasModuleId.trim() || undefined,
      completionPreset: form.canvasCompletionPreset,
      returnMode: form.canvasReturnMode,
    },
  },
});

const buildFormFromIntegration = (integration: Integration): IntegrationFormState => ({
  name: integration.name,
  provider: integration.provider,
  description: integration.description || '',
  status: integration.status,
  mode: integration.mode,
  templateId: integration.templateId,
  certificateTitle: integration.defaults.certificateTitle || '',
  issuerName: integration.defaults.issuerName || '',
  descriptionDefault: integration.defaults.description || '',
  autoGeneratePdf: integration.settings.autoGeneratePdf,
  googleSheetsEnabled: integration.settings.googleSheets?.enabled ?? integration.provider === 'google_sheets',
  googleSheetsSpreadsheetId: integration.settings.googleSheets?.spreadsheetId || '',
  googleSheetsSheetName: integration.settings.googleSheets?.sheetName || 'Ready to Issue',
  googleSheetsStatusColumn:
    integration.settings.googleSheets?.statusColumn ||
    GOOGLE_SHEETS_DEFAULT_MAPPING.statusColumn,
  googleSheetsCertificateIdColumn:
    integration.settings.googleSheets?.certificateIdColumn ||
    GOOGLE_SHEETS_DEFAULT_MAPPING.certificateIdColumn,
  googleSheetsPdfUrlColumn:
    integration.settings.googleSheets?.pdfUrlColumn ||
    GOOGLE_SHEETS_DEFAULT_MAPPING.pdfUrlColumn,
  googleSheetsBatchJobIdColumn:
    integration.settings.googleSheets?.batchJobIdColumn || 'Certify Batch ID',
  googleSheetsProcessedAtColumn:
    integration.settings.googleSheets?.processedAtColumn || 'Processed At',
  canvasEnabled: integration.settings.canvas?.enabled ?? integration.provider === 'canvas',
  canvasBaseUrl: integration.settings.canvas?.baseUrl || '',
  canvasCourseId: integration.settings.canvas?.courseId || '',
  canvasAssignmentId: integration.settings.canvas?.assignmentId || '',
  canvasModuleId: integration.settings.canvas?.moduleId || '',
  canvasCompletionPreset:
    integration.settings.canvas?.completionPreset || 'course_completion',
  canvasReturnMode: integration.settings.canvas?.returnMode || 'submission_comment',
});

const buildCanvasPresetFromRecipe = (
  recipeId: string
): CanvasCompletionPreset => {
  if (recipeId.includes('module')) {
    return 'module_completion';
  }

  if (recipeId.includes('capstone')) {
    return 'capstone_completion';
  }

  return 'course_completion';
};

const buildDemoTestResult = (
  integration: Integration,
  templateName?: string
): IntegrationTestResult => {
  const samplePayload =
    integration.mode === 'batch'
      ? {
          mode: 'batch',
          templateId: integration.templateId,
          templateName,
          ...(integration.provider === 'google_sheets'
            ? {
                spreadsheetId:
                  integration.settings.googleSheets?.spreadsheetId || 'demo-spreadsheet-id',
                sheetName:
                  integration.settings.googleSheets?.sheetName || 'Ready to Issue',
              }
            : {}),
          data: [
            {
              ...(integration.provider === 'google_sheets' ? { sheetRowNumber: 2 } : {}),
              recipientName: 'Ava Morgan',
              recipientEmail: 'ava@example.com',
              certificateTitle:
                integration.defaults.certificateTitle || 'Certificate of Achievement',
              issuerName: integration.defaults.issuerName || 'Certify',
              issueDate: new Date().toISOString(),
            },
            ...(integration.provider === 'google_sheets'
              ? [
                  {
                    sheetRowNumber: 3,
                    recipientName: 'Noah Bennett',
                    recipientEmail: 'noah@example.com',
                    certificateTitle:
                      integration.defaults.certificateTitle ||
                      'Certificate of Achievement',
                    issuerName: integration.defaults.issuerName || 'Certify',
                    issueDate: new Date().toISOString(),
                  },
                ]
              : []),
          ],
        }
      : {
          templateId: integration.templateId,
          templateName,
          ...(integration.provider === 'google_sheets'
            ? {
                sheetRowNumber: 2,
                spreadsheetId:
                  integration.settings.googleSheets?.spreadsheetId || 'demo-spreadsheet-id',
                sheetName:
                  integration.settings.googleSheets?.sheetName || 'Ready to Issue',
              }
            : {}),
          ...(integration.provider === 'canvas'
            ? {
                canvasUserId: '12345',
                canvasCourseId: integration.settings.canvas?.courseId || '42',
                canvasAssignmentId: integration.settings.canvas?.assignmentId || '8',
              }
            : {}),
          recipientName: 'Ava Morgan',
          recipientEmail: 'ava@example.com',
          certificateTitle:
            integration.defaults.certificateTitle || 'Certificate of Achievement',
          issuerName: integration.defaults.issuerName || 'Certify',
          description:
            integration.defaults.description || 'Issued automatically from your connected app.',
          issueDate: new Date().toISOString(),
        };

  return {
    connection: 'ready',
    webhookUrl: integration.webhookUrl,
    samplePayload,
    sampleCurl: `curl -X POST "${integration.webhookUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(samplePayload)}'`,
    notes: [
      'Send JSON to the webhook URL from your automation or platform.',
      'Override title, issuer, dates, and templateId in each request when needed.',
      integration.mode === 'batch'
        ? 'Batch mode queues a background job with a data array.'
        : 'Single mode creates one certificate immediately.',
    ],
    nativeChecks:
      integration.provider === 'google_sheets'
        ? [
            {
              label: 'Google Sheets sync',
              status: integration.settings.googleSheets?.enabled ? 'configured' : 'missing',
              detail: integration.settings.googleSheets?.enabled
                ? 'The integration is configured to write queued and issued statuses back to the target sheet.'
                : 'Enable Google Sheets sync and provide a spreadsheet ID to unlock server-side write-back.',
            },
          ]
        : integration.provider === 'canvas'
          ? [
              {
                label: 'Canvas API handoff',
                status: integration.settings.canvas?.enabled ? 'configured' : 'missing',
                detail: integration.settings.canvas?.enabled
                  ? 'The integration is configured to return certificate links to Canvas after issuing.'
                  : 'Enable Canvas API handoff and provide course details to unlock native callbacks.',
              },
            ]
          : [
              {
                label: 'Webhook-only flow',
                status: 'configured',
                detail: 'This provider relies on the webhook contract only.',
              },
            ],
  };
};

const formatRelativeTime = (value?: string): string => {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const scrollToIntegrationForm = () => {
  if (typeof document === 'undefined') {
    return;
  }

  document.getElementById('integration-form')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const Integrations: React.FC = () => {
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { isDemoMode, mockIntegrations, setMockIntegrations } = useDemo();
  const [catalog, setCatalog] = useState<IntegrationCatalogItem[]>(INTEGRATION_CATALOG);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guideProvider, setGuideProvider] =
    useState<IntegrationProvider>('google_sheets');
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<IntegrationTestResult | null>(null);
  const [canvasPresetId, setCanvasPresetId] =
    useState<string>('canvas-course-completion');
  const [sheetMapping, setSheetMapping] = useState(GOOGLE_SHEETS_DEFAULT_MAPPING);
  const [form, setForm] = useState<IntegrationFormState>(createInitialForm());

  useEffect(() => {
    const load = async () => {
      if (isDemoMode) {
        setCatalog(INTEGRATION_CATALOG);
        setIntegrations(mockIntegrations);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [catalogResult, integrationResult] = await Promise.all([
          fetchIntegrationCatalog().catch(() => ({ data: INTEGRATION_CATALOG })),
          fetchIntegrations(),
        ]);

        setCatalog(catalogResult.data || INTEGRATION_CATALOG);
        setIntegrations(integrationResult.data || []);
      } catch (err) {
        setCatalog(INTEGRATION_CATALOG);
        setError(err instanceof Error ? err.message : 'Failed to load integrations.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isDemoMode, mockIntegrations]);

  useEffect(() => {
    if (!form.templateId && templates[0]?._id) {
      setForm((current) => ({ ...current, templateId: templates[0]._id }));
    }
  }, [form.templateId, templates]);

  useEffect(() => {
    if (!selectedId && integrations[0]?._id) {
      setSelectedId(integrations[0]._id);
    }
  }, [integrations, selectedId]);

  const selectedIntegration = useMemo(
    () => integrations.find((integration) => integration._id === selectedId) || null,
    [integrations, selectedId]
  );

  const templateNameById = useMemo(
    () => new Map(templates.map((template) => [template._id, template.name])),
    [templates]
  );

  const catalogByProvider = useMemo(
    () => new Map(catalog.map((item) => [item.provider, item])),
    [catalog]
  );

  const activeGuide = useMemo(
    () => getIntegrationGuide(guideProvider),
    [guideProvider]
  );

  const formGuide = useMemo(() => getIntegrationGuide(form.provider), [form.provider]);

  const activeSpotlight = useMemo(
    () => getIntegrationSpotlight(guideProvider),
    [guideProvider]
  );

  const activeCatalogItem =
    catalogByProvider.get(guideProvider) || INTEGRATION_CATALOG[0];

  const primaryCatalogItems = useMemo(
    () =>
      PRIMARY_INTEGRATION_PROVIDERS.map((provider) => catalogByProvider.get(provider)).filter(
        Boolean
      ) as IntegrationCatalogItem[],
    [catalogByProvider]
  );

  const fallbackCatalogItems = useMemo(
    () =>
      FALLBACK_INTEGRATION_PROVIDERS.map((provider) => catalogByProvider.get(provider)).filter(
        Boolean
      ) as IntegrationCatalogItem[],
    [catalogByProvider]
  );


  const selectedTemplateName =
    templateNameById.get(form.templateId) || selectedIntegration?.templateName || '';

  const guideIntegration = useMemo(
    () => integrations.find((integration) => integration.provider === guideProvider) || null,
    [guideProvider, integrations]
  );

  const activeTemplateId =
    (form.provider === guideProvider && form.templateId) ||
    guideIntegration?.templateId ||
    templates[0]?._id ||
    '';

  const activeCanvasPreset = useMemo(() => {
    if (guideProvider !== 'canvas') {
      return null;
    }

    return (
      activeGuide.recipes.find((recipe) => recipe.id === canvasPresetId) ||
      activeGuide.recipes[0] ||
      null
    );
  }, [activeGuide.recipes, canvasPresetId, guideProvider]);

  const activeWebhookUrl =
    guideIntegration?.webhookUrl ||
    'https://your-certify-domain/api/integrations/hooks/ig_xxx';

  const googleSheetsStarterSnippet = useMemo(
    () =>
      buildGoogleSheetsStarterSnippet({
        webhookUrl: activeWebhookUrl,
        templateId: activeTemplateId,
        mapping: sheetMapping,
      }),
    [activeTemplateId, activeWebhookUrl, sheetMapping]
  );

  const canvasPayloadSnippet = useMemo(
    () =>
      activeCanvasPreset
        ? buildCanvasPayloadSnippet({
            webhookUrl: activeWebhookUrl,
            recipe: activeCanvasPreset,
            templateId: activeTemplateId,
          })
        : '',
    [activeCanvasPreset, activeTemplateId, activeWebhookUrl]
  );

  const providerReturnSnippet = useMemo(
    () => buildCertificateReturnSnippet(guideProvider),
    [guideProvider]
  );

  const recipesHeading =
    guideProvider === 'canvas'
      ? 'Completion presets'
      : guideProvider === 'google_sheets'
        ? 'Sheet launch kits'
        : guideProvider === 'custom'
          ? 'Advanced fallback patterns'
          : 'Ready-to-apply workflow recipes';

  const workspaceTemplateMatches = useMemo(() => {
    const seen = new Set<string>();
    const matches: Array<{ recipe: IntegrationRecipe; template: Template }> = [];

    activeGuide.recipes.forEach((recipe) => {
      const template = findBestTemplateForRecipe(recipe, templates);
      if (template && !seen.has(template._id)) {
        seen.add(template._id);
        matches.push({ recipe, template });
      }
    });

    return matches;
  }, [activeGuide.recipes, templates]);

  const onboardingMilestones = useMemo(
    () => [
      {
        label: 'Choose a provider',
        detail: `${activeCatalogItem.label} guide is loaded for this setup flow.`,
        complete: true,
      },
      {
        label: 'Pair a template',
        detail:
          selectedTemplateName ||
          (templatesLoading
            ? 'Loading workspace templates...'
            : 'Pick the template this provider should use by default.'),
        complete: Boolean(selectedTemplateName),
      },
      {
        label: 'Configure the workflow',
        detail:
          form.name.trim() ||
          selectedIntegration?.name ||
          'Name the integration and define the default issuer details.',
        complete: Boolean(form.name.trim() || selectedIntegration),
      },
      {
        label: 'Run a setup test',
        detail:
          testResult || selectedIntegration?.stats.lastTestedAt
            ? `Payload ready${
                selectedIntegration?.stats.lastTestedAt
                  ? `, last tested ${formatRelativeTime(
                      selectedIntegration.stats.lastTestedAt
                    )}`
                  : ''
              }.`
            : 'Generate the sample payload and curl command before you go live.',
        complete: Boolean(testResult || selectedIntegration?.stats.lastTestedAt),
      },
    ],
    [
      activeCatalogItem.label,
      form.name,
      selectedIntegration,
      selectedTemplateName,
      templatesLoading,
      testResult,
    ]
  );

  const activeCount = integrations.filter((integration) => integration.status === 'active').length;
  const totalRuns = integrations.reduce(
    (sum, integration) => sum + integration.stats.totalRuns,
    0
  );
  const successfulRuns = integrations.reduce(
    (sum, integration) => sum + integration.stats.successRuns,
    0
  );
  const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;


  const resetForm = () => {
    setEditingId(null);
    setActionError(null);
    setTestResult(null);
    setCanvasPresetId('canvas-course-completion');
    setSheetMapping(GOOGLE_SHEETS_DEFAULT_MAPPING);
    setForm(createInitialForm(templates[0]?._id || ''));
  };

  const handleCopyWebhook = async (integration: Integration) => {
    try {
      await navigator.clipboard.writeText(integration.webhookUrl);
      setCopiedWebhookId(integration._id);
      setTimeout(() => setCopiedWebhookId(null), 1800);
    } catch {
      setActionError('Failed to copy webhook URL.');
    }
  };

  const handleEdit = (integration: Integration) => {
    setEditingId(integration._id);
    setSelectedId(integration._id);
    setGuideProvider(integration.provider);
    setActionError(null);
    setTestResult(null);
    setForm(buildFormFromIntegration(integration));
    if (integration.provider === 'google_sheets') {
      setSheetMapping({
        recipientName: GOOGLE_SHEETS_DEFAULT_MAPPING.recipientName,
        recipientEmail: GOOGLE_SHEETS_DEFAULT_MAPPING.recipientEmail,
        certificateTitle: GOOGLE_SHEETS_DEFAULT_MAPPING.certificateTitle,
        issueDate: GOOGLE_SHEETS_DEFAULT_MAPPING.issueDate,
        statusColumn:
          integration.settings.googleSheets?.statusColumn ||
          GOOGLE_SHEETS_DEFAULT_MAPPING.statusColumn,
        certificateIdColumn:
          integration.settings.googleSheets?.certificateIdColumn ||
          GOOGLE_SHEETS_DEFAULT_MAPPING.certificateIdColumn,
        pdfUrlColumn:
          integration.settings.googleSheets?.pdfUrlColumn ||
          GOOGLE_SHEETS_DEFAULT_MAPPING.pdfUrlColumn,
      });
    }
    scrollToIntegrationForm();
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.templateId) {
      setActionError('Name and template are required.');
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      if (isDemoMode) {
        const now = new Date().toISOString();
        const templateName = templateNameById.get(form.templateId);

        if (editingId) {
          const updated = mockIntegrations.map((integration) =>
            integration._id === editingId
              ? {
                  ...integration,
                  ...buildPayloadFromForm(form),
                  templateName,
                  webhookUrl: integration.webhookUrl,
                  updatedAt: now,
                }
              : integration
          ) as Integration[];

          setMockIntegrations(updated);
          setIntegrations(updated);
        } else {
          const payload = buildPayloadFromForm(form);
          const integration: Integration = {
            _id: `integration-demo-${Date.now()}`,
            ...payload,
            status: form.status,
            defaults: payload.defaults || {},
            settings: payload.settings || { autoGeneratePdf: form.autoGeneratePdf },
            webhookUrl: `https://demo.certify.app/api/integrations/hooks/ig_demo_${Date.now()}`,
            templateName,
            stats: {
              totalRuns: 0,
              successRuns: 0,
              failedRuns: 0,
            },
            createdAt: now,
            updatedAt: now,
          };

          const next = [integration, ...mockIntegrations];
          setMockIntegrations(next);
          setIntegrations(next);
          setSelectedId(integration._id);
          setGuideProvider(integration.provider);
        }

        resetForm();
        return;
      }

      if (editingId) {
        const result = await updateIntegration(editingId, buildPayloadFromForm(form));
        const updated = result.data;
        if (updated) {
          setIntegrations((current) =>
            current.map((integration) =>
              integration._id === editingId ? updated : integration
            )
          );
          setSelectedId(updated._id);
          setGuideProvider(updated.provider);
        }
      } else {
        const result = await createIntegration(buildPayloadFromForm(form));
        const created = result.data;
        if (created) {
          setIntegrations((current) => [created, ...current]);
          setSelectedId(created._id);
          setGuideProvider(created.provider);
        }
      }

      resetForm();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save integration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (integrationId: string) => {
    setActionError(null);

    try {
      if (isDemoMode) {
        const next = mockIntegrations.filter((integration) => integration._id !== integrationId);
        setMockIntegrations(next);
        setIntegrations(next);
      } else {
        await deleteIntegration(integrationId);
        setIntegrations((current) =>
          current.filter((integration) => integration._id !== integrationId)
        );
      }

      if (selectedId === integrationId) {
        setSelectedId(null);
        setTestResult(null);
      }

      if (editingId === integrationId) {
        resetForm();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete integration.');
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    const nextStatus: IntegrationStatus =
      integration.status === 'active' ? 'paused' : 'active';

    try {
      if (isDemoMode) {
        const next = mockIntegrations.map((item) =>
          item._id === integration._id
            ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
            : item
        );
        setMockIntegrations(next);
        setIntegrations(next);
        return;
      }

      const result = await updateIntegration(integration._id, { status: nextStatus });
      if (result.data) {
        setIntegrations((current) =>
          current.map((item) => (item._id === integration._id ? result.data! : item))
        );
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleTest = async (integration: Integration) => {
    try {
      setSelectedId(integration._id);
      setGuideProvider(integration.provider);
      setActionError(null);

      if (isDemoMode) {
        setTestResult(buildDemoTestResult(integration, integration.templateName));
        return;
      }

      const result = await testIntegration(integration._id);
      setTestResult(result.data || null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to test integration.');
    }
  };

  const handleLoadProviderIntoForm = (
    provider: IntegrationProvider,
    mode: IntegrationMode
  ) => {
    setGuideProvider(provider);
    setActionError(null);
    if (provider === 'canvas') {
      setCanvasPresetId('canvas-course-completion');
    }
    if (provider === 'google_sheets') {
      setSheetMapping(GOOGLE_SHEETS_DEFAULT_MAPPING);
    }
    setForm((current) => ({
      ...current,
      provider,
      mode,
      autoGeneratePdf: mode === 'single',
      googleSheetsEnabled:
        provider === 'google_sheets' ? true : current.googleSheetsEnabled,
      canvasEnabled: provider === 'canvas' ? true : current.canvasEnabled,
      canvasReturnMode:
        provider === 'canvas' ? 'submission_comment' : current.canvasReturnMode,
    }));
    scrollToIntegrationForm();
  };

  const handleApplyRecipe = (recipe: IntegrationRecipe) => {
    const matchedTemplate = findBestTemplateForRecipe(recipe, templates);

    setGuideProvider(activeGuide.provider);
    setActionError(null);
    if (activeGuide.provider === 'canvas') {
      setCanvasPresetId(recipe.id);
    }
    setForm((current) => ({
      ...current,
      name: current.name.trim() || recipe.name,
      provider: activeGuide.provider,
      mode: recipe.mode,
      templateId: matchedTemplate?._id || current.templateId || templates[0]?._id || '',
      description: recipe.automationHint,
      certificateTitle: recipe.certificateTitle,
      issuerName: recipe.issuerName,
      descriptionDefault: recipe.description,
      autoGeneratePdf: recipe.mode === 'single',
      googleSheetsEnabled:
        activeGuide.provider === 'google_sheets' ? true : current.googleSheetsEnabled,
      canvasEnabled: activeGuide.provider === 'canvas' ? true : current.canvasEnabled,
      canvasCompletionPreset:
        activeGuide.provider === 'canvas'
          ? buildCanvasPresetFromRecipe(recipe.id)
          : current.canvasCompletionPreset,
      canvasReturnMode:
        activeGuide.provider === 'canvas' ? 'submission_comment' : current.canvasReturnMode,
    }));
    scrollToIntegrationForm();
  };

  const handleApplyTemplateMatch = (
    template: Template,
    recipe?: IntegrationRecipe
  ) => {
    setActionError(null);
    setForm((current) => ({
      ...current,
      provider: activeGuide.provider,
      mode: recipe?.mode || current.mode,
      templateId: template._id,
      name: current.name.trim() || recipe?.name || current.name,
      description: recipe?.automationHint || current.description,
      certificateTitle: recipe?.certificateTitle || current.certificateTitle,
      issuerName: recipe?.issuerName || current.issuerName,
      descriptionDefault: recipe?.description || current.descriptionDefault,
      autoGeneratePdf: recipe ? recipe.mode === 'single' : current.autoGeneratePdf,
    }));
    scrollToIntegrationForm();
  };

  const activePlaybookGuide = selectedIntegration
    ? getIntegrationGuide(selectedIntegration.provider)
    : activeGuide;

  const activePlaybook =
    selectedIntegration &&
    (testResult && testResult.webhookUrl === selectedIntegration.webhookUrl
      ? testResult
      : buildDemoTestResult(selectedIntegration, selectedIntegration.templateName));

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded border border-base-200 bg-base-100 shadow-sm"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.02),rgba(59,130,246,0.03))]" />
          <div className="relative grid gap-6 px-6 py-8 md:grid-cols-[1.4fr_0.9fr] md:px-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                <Webhook size={12} />
                Automation Center
              </div>
              <h1 className="text-3xl font-black tracking-tight text-base-content md:text-4xl lg:text-5xl">
                Integrations Hub
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-base-content/60 md:text-base">
                Connect your business workflows and automate certificate issuance with 
                Google Sheets, Canvas LMS, and Webhooks.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ y: -3 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link
                    to={ROUTES.TEMPLATE_BUILDER}
                    className="btn btn-primary rounded px-6 font-bold"
                  >
                    Pair with Template
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
                <motion.a
                  href="#integration-form"
                  className="btn btn-ghost rounded border border-base-200 px-5 font-bold"
                  whileHover={{ y: -3, backgroundColor: 'rgba(226,232,240,0.7)' }}
                  whileTap={TAP_PRESS}
                  transition={QUICK_SPRING}
                >
                  Setup Guide
                </motion.a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: 'Spotlight', value: activeCatalogItem.label, detail: 'Selected provider' },
                  { label: 'Launch Kits', value: activeGuide.recipes.length, detail: 'Ready recipes' },
                  { label: 'Sync Status', value: workspaceTemplateMatches.length, detail: 'Matches found' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SOFT_SPRING, delay: index * 0.05 }}
                    className="rounded border border-base-200 bg-base-100/60 p-4 shadow-sm"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">{stat.label}</p>
                    <p className="mt-1 text-lg font-black text-base-content">{stat.value}</p>
                    <p className="text-[11px] text-base-content/50">{stat.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Integrations', value: integrations.length },
                  { label: 'Active Flows', value: activeCount },
                  { label: 'Automations', value: totalRuns },
                  { label: 'Success', value: `${successRate}%` },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="rounded border border-primary/10 bg-primary/5 p-5 shadow-sm text-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SOFT_SPRING, delay: index * 0.04 }}
                    whileHover={{ y: -4 }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-base-content">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Primary Channels
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content md:text-3xl">
                Ready-to-Issue Launch Kits
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-base-content/60">
                Choose a workflow provider to access step-by-step onboarding recipes. 
                Google Sheets and Canvas are the recommended paths for fast, automated issuance.
              </p>
            </div>
            <div className="hidden rounded bg-base-200/50 px-4 py-3 text-xs font-semibold text-base-content/50 lg:block">
              Focused onboarding for production workflows.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {primaryCatalogItems.map((item, index) => {
              const spotlight = getIntegrationSpotlight(item.provider);

              return (
                <motion.article
                  key={item.provider}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SOFT_SPRING, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className={`group relative overflow-hidden rounded border p-6 shadow-sm transition-all ${
                    guideProvider === item.provider
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-base-200 bg-base-100 hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded bg-primary/10 p-3 text-primary shadow-sm">
                      <Globe size={22} />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                       {spotlight.highlights.slice(0, 2).map((highlight) => (
                         <span key={highlight} className="rounded bg-base-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-base-content/60">
                           {highlight}
                         </span>
                       ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-black tracking-tight text-base-content">
                      {item.label}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-base-content/60 line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setGuideProvider(item.provider)}
                      className={`btn btn-sm w-full font-bold ${
                        guideProvider === item.provider ? 'btn-primary' : 'btn-ghost border-base-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {guideProvider === item.provider ? 'Active Guide' : 'Open Setup Guide'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() =>
                        handleLoadProviderIntoForm(item.provider, item.recommendedMode)
                      }
                      className="btn btn-sm btn-outline border-base-200 font-bold hover:btn-primary"
                    >
                      {spotlight.ctaLabel}
                    </button>
                  </div>
                </motion.article>
              );
            })}

            {fallbackCatalogItems.map((item) => {

              return (
                <motion.article
                  key={item.provider}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SOFT_SPRING, delay: 0.12 }}
                  whileHover={{ y: -6 }}
                  className={`relative overflow-hidden rounded border p-6 shadow-sm transition-all ${
                    guideProvider === item.provider
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-base-200 bg-base-100 hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded bg-base-200 p-3 text-base-content/70 shadow-sm">
                      <Webhook size={22} />
                    </div>
                    <span className="rounded bg-warning/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-warning">
                      Fallback Mode
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-black tracking-tight text-base-content">
                      {item.label}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-base-content/60">
                      Standard webhook integration for custom platforms and advanced logic.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setGuideProvider(item.provider)}
                      className={`btn btn-sm w-full font-bold ${
                        guideProvider === item.provider ? 'btn-primary' : 'btn-ghost border-base-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Logic
                    </motion.button>
                    <button
                      type="button"
                      onClick={() =>
                        handleLoadProviderIntoForm(item.provider, item.recommendedMode)
                      }
                      className="btn btn-sm btn-outline border-base-200 font-bold hover:btn-primary"
                    >
                      Manual Setup
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>

        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded border border-base-200 bg-base-100 shadow-sm overflow-hidden"
        >
          <div className="grid gap-0 xl:grid-cols-[400px_1fr] border-b border-base-200">
            <div className="bg-base-200/30 p-6 md:p-8 border-b xl:border-b-0 xl:border-r border-base-200">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                    Configuration Center
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                    {activeCatalogItem.label} Playbook
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-base-content/60">
                    {activeGuide.headline}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {[
                    { label: 'Primary Mode', value: activeCatalogItem.recommendedMode },
                    { label: 'Library Matches', value: workspaceTemplateMatches.length || '0' },
                    { label: 'QA Protocols', value: activeGuide.qaChecks.length },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="rounded border border-base-200 bg-base-100 p-4 shadow-sm"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-base-content/40">
                        {item.label}
                      </p>
                      <p className="mt-1 text-base font-black text-base-content uppercase">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Right column content starts here */}

                <div className="rounded border border-base-200 bg-base-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={14} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Setup Lead
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-base-content/65">
                    {activeGuide.setupLead}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeGuide.idealFor.map((item) => (
                      <span
                        key={item}
                        className="rounded bg-primary/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 pl-1">
                    Onboarding Landmarks
                  </p>
                  <div className="space-y-2">
                    {onboardingMilestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.label}
                        className={`flex gap-3 rounded border px-4 py-3 shadow-sm transition-colors ${
                          milestone.complete ? 'border-success/20 bg-success/5' : 'border-base-200 bg-base-100'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-black ${
                            milestone.complete
                              ? 'bg-success text-success-content'
                              : 'bg-base-200 text-base-content/40'
                          }`}
                        >
                          {milestone.complete ? <Check size={12} /> : index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-base-content">{milestone.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-base-content/50">
                            {milestone.detail}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-base-100">
              {/* Main Instruction Flow */}

            <div className="space-y-6">
              <div className="rounded border border-base-200 bg-base-100 p-5">
                {guideProvider === 'google_sheets' ? (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Sync Configuration
                        </p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-base-content">
                          Column Mapping
                        </h3>
                        <p className="mt-2 text-sm text-base-content/60">
                          Define exactly which spreadsheet headers contain your certificate data.
                        </p>
                      </div>
                      
                      <div className="grid gap-4">
                        {[
                          {
                            key: 'recipientName',
                            label: 'Recipient Name',
                            helper: 'Full name for the certificate',
                          },
                          {
                            key: 'recipientEmail',
                            label: 'Recipient Email',
                            helper: 'Used for delivery and tracking',
                          },
                          {
                            key: 'certificateTitle',
                            label: 'Issue Title',
                            helper: 'Workshop or Course name',
                          },
                          {
                            key: 'issueDate',
                            label: 'Issue Date',
                            helper: 'ISO or Spreadsheet date format',
                          },
                          {
                            key: 'statusColumn',
                            label: 'Status Row',
                            helper: 'Write-back column for state',
                          },
                        ].map((field) => (
                          <div key={field.key} className="rounded border border-base-200 bg-base-100 p-4 shadow-sm hover:border-primary/20 transition-all">
                            <label className="form-control w-full">
                              <span className="label-text mb-2 font-bold text-base-content flex items-center justify-between">
                                {field.label}
                                <span className="text-[9px] font-black uppercase text-base-content/30 tracking-widest">{field.key}</span>
                              </span>
                              <input
                                value={sheetMapping[field.key as keyof typeof GOOGLE_SHEETS_DEFAULT_MAPPING]}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setSheetMapping(c => ({...c, [field.key]: nextValue}));
                                  if (field.key === 'statusColumn') setForm(f => ({...f, googleSheetsStatusColumn: nextValue}));
                                }}
                                className="input input-sm input-bordered rounded bg-base-200/50"
                                placeholder={`e.g. ${field.label}`}
                              />
                              <p className="mt-2 text-[10px] text-base-content/50 italic">{field.helper}</p>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded border border-base-200 bg-base-900 overflow-hidden shadow-lg">
                        <div className="border-b border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Apps Script Starter</p>
                           <span className="badge badge-primary badge-xs font-bold px-2 py-2">v4.0</span>
                        </div>
                        <div className="relative group">
                          <pre className="overflow-x-auto p-5 text-[11px] leading-relaxed text-blue-100/90 font-mono">
                            {googleSheetsStarterSnippet}
                          </pre>
                        </div>
                      </div>

                      <div className="rounded border border-base-200 bg-base-200/40 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                          Workflow Handshake
                        </p>
                        <div className="mt-4 space-y-3">
                          {activeSpotlight.flowSteps.map((step, idx) => (
                            <div key={step.title} className="flex gap-3">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/20 text-[10px] font-black text-primary">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-base-content">{step.title}</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-base-content/50">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : guideProvider === 'canvas' ? (
                 <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Instructional Assets
                        </p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-base-content">
                          Course & Module Presets
                        </h3>
                        <p className="mt-2 text-sm text-base-content/60">
                          Deploy pre-configured logic for common Canvas LMS trigger points.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        {activeGuide.recipes.map((recipe) => (
                          <motion.article
                            key={recipe.id}
                            className={`rounded border p-5 shadow-sm transition-all ${
                              activeCanvasPreset?.id === recipe.id
                                ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                                : 'border-base-200 bg-base-100 hover:border-primary/20'
                            }`}
                            whileHover={{ y: -4 }}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-black text-base-content">{recipe.name}</p>
                                <p className="mt-1 text-xs leading-relaxed text-base-content/50">
                                  {recipe.summary}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCanvasPresetId(recipe.id);
                                  handleApplyRecipe(recipe);
                                }}
                                className={`btn btn-sm font-bold ${
                                  activeCanvasPreset?.id === recipe.id ? 'btn-primary' : 'btn-ghost border-base-200'
                                }`}
                              >
                                {activeCanvasPreset?.id === recipe.id ? 'Applied' : 'Use Preset'}
                              </button>
                            </div>
                          </motion.article>
                        ))}
                      </div>

                      <div className="rounded border border-base-200 bg-base-200/40 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 pl-1">
                          Learner Attribute Mapping
                        </p>
                        <div className="mt-4 space-y-2">
                          {activeGuide.fieldMappings.map((field) => (
                            <div
                              key={`${field.source}-${field.target}`}
                              className="flex items-center justify-between rounded border border-base-200 bg-base-100 px-4 py-2.5 shadow-sm"
                            >
                              <span className="text-[10px] font-black uppercase tracking-wider text-base-content/40">{field.source}</span>
                              <div className="flex items-center gap-2">
                                <ArrowRight size={12} className="text-primary/40" />
                                <span className="text-xs font-bold text-base-content">{field.target}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded border border-base-200 bg-base-900 overflow-hidden shadow-lg">
                        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Completion Payload</p>
                        </div>
                        <pre className="overflow-x-auto p-5 text-[11px] leading-relaxed text-blue-100/90 font-mono">
                          {canvasPayloadSnippet}
                        </pre>
                      </div>

                      <div className="rounded border border-base-200 bg-base-200/40 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                          Handoff Logic
                        </p>
                        <div className="mt-4 space-y-4">
                          {activeSpotlight.flowSteps.map((step, idx) => (
                            <div key={step.title} className="flex gap-4">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-black text-primary">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-base-content">{step.title}</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-base-content/50">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : guideProvider === 'custom' ? (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Advanced Rollout
                        </p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-base-content">
                          Custom Webhook Flow
                        </h3>
                        <p className="mt-2 text-sm text-base-content/60">
                          Orchestrate complex automation sequences using our universal webhook endpoint.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {activeSpotlight.flowSteps.map((step, idx) => (
                          <div key={step.title} className="flex gap-4 p-4 rounded border border-base-200 bg-base-100 shadow-sm">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-base-200 text-[11px] font-black text-base-content">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-base-content">{step.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-base-content/50">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded border border-base-200 bg-base-900 overflow-hidden shadow-lg">
                        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Response Contract</p>
                        </div>
                        <pre className="overflow-x-auto p-5 text-[11px] leading-relaxed text-blue-100/90 font-mono">
                          {providerReturnSnippet}
                        </pre>
                      </div>

                      <div className="rounded border border-warning/20 bg-warning/5 p-5">
                         <div className="flex items-center gap-2 text-warning">
                            <AlertCircle size={14} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Usage Warning</p>
                         </div>
                         <p className="mt-3 text-xs leading-relaxed text-base-content/70">
                           Custom Webhooks are flexible but assume your system can safely store 
                           the endpoint and handle our response payloads for batch or single jobs.
                         </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Technical Setup</p>
                        <div className="mt-6 space-y-4">
                          {activeGuide.setupSteps.map((step, idx) => (
                            <div key={step.title} className="flex gap-4 p-4 rounded border border-base-200 bg-base-100 shadow-sm">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-base-content">{step.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-base-content/50">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                    
                    <div className="rounded border border-base-200 bg-base-200/40 p-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 pl-1">Contract Mappings</p>
                        <div className="mt-6 space-y-3">
                          {activeGuide.fieldMappings.map((field) => (
                            <div key={`${field.source}-${field.target}`} className="rounded border border-base-200 bg-base-100 p-4 shadow-sm">
                               <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{field.source}</p>
                               <div className="mt-2 flex items-center gap-2 text-sm font-bold text-base-content">
                                 <ArrowRight size={14} className="text-primary" />
                                 {field.target}
                               </div>
                               <p className="mt-1 text-[11px] text-base-content/40 italic">Example: {field.example}</p>
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded border border-base-200 bg-base-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                      {guideProvider === 'canvas'
                        ? 'Canvas launch presets'
                        : guideProvider === 'google_sheets'
                          ? 'Google Sheets launch kits'
                          : guideProvider === 'custom'
                            ? 'Advanced fallback kits'
                            : 'Sample launch kits'}
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-base-content">
                      {recipesHeading}
                    </h3>
                  </div>
                  <Link to={ROUTES.TEMPLATES} className="btn btn-ghost rounded px-4 font-bold">
                    Browse All Templates
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {activeGuide.recipes.map((recipe) => {
                    const matchedTemplate = findBestTemplateForRecipe(recipe, templates);

                    return (
                      <motion.article
                        key={recipe.id}
                        className="rounded border border-base-200 bg-base-100 p-5"
                        whileHover={{ y: -5 }}
                        transition={SOFT_SPRING}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-outline border-primary/20 bg-primary/5 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                            {recipe.mode}
                          </span>
                          <span className="badge badge-ghost px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-base-content/55">
                            {recipe.recommendedTemplateCategory}
                          </span>
                        </div>
                        <h4 className="mt-3 text-lg font-black tracking-tight text-base-content">
                          {recipe.name}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                          {recipe.summary}
                        </p>
                        <div className="mt-4 rounded border border-base-200 bg-base-200/35 px-4 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                            Template direction
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                            {recipe.templateHint}
                          </p>
                          <p className="mt-3 text-xs text-base-content/55">
                            Workspace match:{' '}
                            <span className="font-bold text-base-content">
                              {matchedTemplate?.name || 'Choose any template manually'}
                            </span>
                          </p>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-base-content/55">
                          {recipe.automationHint}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <motion.button
                            type="button"
                            onClick={() => handleApplyRecipe(recipe)}
                            className="btn btn-primary rounded px-4 font-bold"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            {guideProvider === 'canvas' ? 'Use Preset' : 'Apply Recipe'}
                          </motion.button>
                          {matchedTemplate && (
                            <motion.button
                              type="button"
                              onClick={() => handleApplyTemplateMatch(matchedTemplate, recipe)}
                              className="btn btn-ghost rounded px-4 font-bold"
                              whileHover={{ y: -2 }}
                              whileTap={TAP_PRESS}
                              transition={QUICK_SPRING}
                            >
                              Use {matchedTemplate.name}
                            </motion.button>
                          )}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>

              <div className="rounded border border-base-200 bg-base-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                      Workspace template matches
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-base-content">
                      Best fits from your library
                    </h3>
                  </div>
                  <Link
                    to={ROUTES.TEMPLATE_BUILDER}
                    className="btn btn-outline rounded px-4 font-bold"
                  >
                    Create a New Template
                  </Link>
                </div>

                {workspaceTemplateMatches.length > 0 ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {workspaceTemplateMatches.map(({ recipe, template }) => (
                      <motion.article
                        key={`${recipe.id}-${template._id}`}
                        className="overflow-hidden rounded border border-base-200 bg-base-100"
                        whileHover={{ y: -5 }}
                        transition={SOFT_SPRING}
                      >
                        <div className="aspect-[4/3] overflow-hidden border-b border-base-200 bg-base-200/35">
                          <motion.img
                            src={template.thumbnail}
                            alt={template.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            whileHover={{ scale: 1.04 }}
                            transition={SOFT_SPRING}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="badge badge-ghost px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-base-content/55">
                              {template.category}
                            </span>
                            <span className="badge badge-outline border-primary/20 bg-primary/5 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                              {recipe.name}
                            </span>
                          </div>
                          <h4 className="mt-3 text-lg font-black tracking-tight text-base-content">
                            {template.name}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                            {template.description}
                          </p>
                          <motion.button
                            type="button"
                            onClick={() => handleApplyTemplateMatch(template, recipe)}
                            className="btn btn-sm btn-primary mt-4 rounded px-4 font-bold"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            Use Template
                          </motion.button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded border border-dashed border-base-300 bg-base-200/30 px-6 py-10 text-center">
                    <p className="text-lg font-black text-base-content">
                      No matching templates yet
                    </p>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-base-content/55">
                      Build a template in the recommended category, then come back here to apply
                      it directly from the provider guide.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[0.9fr_1.3fr]">
          <section
            id="integration-form"
            className="h-fit rounded border border-base-200 bg-base-100 p-6 shadow-sm xl:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  {editingId ? 'Edit integration' : 'New integration'}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Build a reusable connection flow
                </h2>
              </div>
              <div className="rounded bg-primary/10 p-3 text-primary">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="form-control w-full">
                <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                  <span className="text-sm font-bold text-base-content">Integration name</span>
                </label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="input input-bordered w-full rounded focus:input-primary"
                  placeholder="Canvas course completions"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                    <span className="text-sm font-bold text-base-content">Provider</span>
                  </label>
                  <select
                    value={form.provider}
                    onChange={(event) => {
                      const provider = event.target.value as IntegrationProvider;
                      const nextGuide = catalogByProvider.get(provider);

                      setGuideProvider(provider);
                      if (provider === 'canvas') {
                        setCanvasPresetId('canvas-course-completion');
                      }
                      if (provider === 'google_sheets') {
                        setSheetMapping(GOOGLE_SHEETS_DEFAULT_MAPPING);
                      }
                      setForm((current) => ({
                        ...current,
                        provider,
                        mode: nextGuide?.recommendedMode || current.mode,
                        autoGeneratePdf:
                          (nextGuide?.recommendedMode || current.mode) === 'single',
                        googleSheetsEnabled:
                          provider === 'google_sheets' ? true : current.googleSheetsEnabled,
                        canvasEnabled:
                          provider === 'canvas' ? true : current.canvasEnabled,
                        canvasReturnMode:
                          provider === 'canvas'
                            ? 'submission_comment'
                            : current.canvasReturnMode,
                      }));
                    }}
                    className="select select-bordered w-full rounded focus:select-primary"
                  >
                    {catalog.map((item) => (
                      <option key={item.provider} value={item.provider}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                    <span className="text-sm font-bold text-base-content">Mode</span>
                  </label>
                  <select
                    value={form.mode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        mode: event.target.value as IntegrationFormState['mode'],
                      }))
                    }
                    className="select select-bordered w-full rounded focus:select-primary"
                  >
                    <option value="single">Single certificate</option>
                    <option value="batch">Batch job</option>
                  </select>
                </div>
              </div>

              <div className="rounded border border-primary/20 bg-primary/5 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      Provider workflow note
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                      {formGuide.setupLead}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setGuideProvider(form.provider)}
                    className="btn btn-sm btn-ghost rounded px-4 font-bold"
                    whileHover={{ y: -2 }}
                    whileTap={TAP_PRESS}
                    transition={QUICK_SPRING}
                  >
                    View Guide
                  </motion.button>
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                  <span className="text-sm font-bold text-base-content">Default template</span>
                </label>
                <select
                  value={form.templateId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, templateId: event.target.value }))
                  }
                  className="select select-bordered w-full rounded focus:select-primary"
                  disabled={templatesLoading || templates.length === 0}
                >
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                  <span className="text-sm font-bold text-base-content">Workflow notes</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="textarea textarea-bordered min-h-32 w-full rounded focus:textarea-primary"
                  placeholder="Describe the source trigger, audience, or automation context."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                    <span className="text-sm font-bold text-base-content">Default title</span>
                  </label>
                  <input
                    value={form.certificateTitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        certificateTitle: event.target.value,
                      }))
                    }
                    className="input input-bordered w-full rounded focus:input-primary"
                    placeholder="Certificate of Achievement"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                    <span className="text-sm font-bold text-base-content">Default issuer</span>
                  </label>
                  <input
                    value={form.issuerName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, issuerName: event.target.value }))
                    }
                    className="input input-bordered w-full rounded focus:input-primary"
                    placeholder="Global Academy"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                  <span className="text-sm font-bold text-base-content">
                    Default description
                  </span>
                </label>
                <textarea
                  value={form.descriptionDefault}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      descriptionDefault: event.target.value,
                    }))
                  }
                  className="textarea textarea-bordered min-h-24 w-full rounded focus:textarea-primary"
                  placeholder="Optional fallback description for incoming payloads."
                />
              </div>

              {form.provider === 'google_sheets' && (
                <div className="rounded border border-base-200 bg-base-200/35 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                        Native Google Sheets sync
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                        Let the backend write queued, issued, and PDF values back into the same
                        spreadsheet rows after Apps Script sends the webhook request.
                      </p>
                    </div>
                    <label className="mt-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded">
                      <input
                        type="checkbox"
                        checked={form.googleSheetsEnabled}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsEnabled: event.target.checked,
                          }))
                        }
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Spreadsheet ID
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsSpreadsheetId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsSpreadsheetId: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="1AbCdEfGh..."
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Sheet name
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsSheetName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsSheetName: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Ready to Issue"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Status column header
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsStatusColumn}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsStatusColumn: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Certify Status"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Batch job ID header
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsBatchJobIdColumn}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsBatchJobIdColumn: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Certify Batch ID"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Certificate ID header
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsCertificateIdColumn}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsCertificateIdColumn: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Certify ID"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          PDF URL header
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsPdfUrlColumn}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsPdfUrlColumn: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Certificate PDF URL"
                      />
                    </div>

                    <div className="form-control w-full md:col-span-2">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Processed-at header
                        </span>
                      </label>
                      <input
                        value={form.googleSheetsProcessedAtColumn}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            googleSheetsProcessedAtColumn: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Processed At"
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-base-content/65">
                    Backend env required: `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
                    `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
                  </div>
                </div>
              )}

              {form.provider === 'canvas' && (
                <div className="rounded border border-base-200 bg-base-200/35 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                        Native Canvas handoff
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                        Use the Canvas API to validate course access during setup tests and return
                        certificate links back into assignment submissions after issuing.
                      </p>
                    </div>
                    <label className="mt-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded">
                      <input
                        type="checkbox"
                        checked={form.canvasEnabled}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasEnabled: event.target.checked,
                          }))
                        }
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Canvas base URL
                        </span>
                      </label>
                      <input
                        value={form.canvasBaseUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasBaseUrl: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="https://canvas.yourschool.edu"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Course ID
                        </span>
                      </label>
                      <input
                        value={form.canvasCourseId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasCourseId: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="42"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Assignment ID
                        </span>
                      </label>
                      <input
                        value={form.canvasAssignmentId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasAssignmentId: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="8"
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Module ID
                        </span>
                      </label>
                      <input
                        value={form.canvasModuleId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasModuleId: event.target.value,
                          }))
                        }
                        className="input input-bordered w-full rounded focus:input-primary"
                        placeholder="Optional module milestone"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Completion preset
                        </span>
                      </label>
                      <select
                        value={form.canvasCompletionPreset}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasCompletionPreset:
                              event.target.value as CanvasCompletionPreset,
                          }))
                        }
                        className="select select-bordered w-full rounded focus:select-primary"
                      >
                        <option value="course_completion">Course completion</option>
                        <option value="module_completion">Module completion</option>
                        <option value="capstone_completion">Capstone completion</option>
                      </select>
                    </div>

                    <div className="form-control w-full">
                      <label className="label cursor-pointer justify-start gap-2 p-0 mb-2">
                        <span className="text-sm font-bold text-base-content">
                          Return mode
                        </span>
                      </label>
                      <select
                        value={form.canvasReturnMode}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            canvasReturnMode: event.target.value as CanvasReturnMode,
                          }))
                        }
                        className="select select-bordered w-full rounded focus:select-primary"
                      >
                        <option value="submission_comment">Assignment comment</option>
                        <option value="response_only">Response only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 rounded border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-base-content/65">
                    Backend env required: `CANVAS_API_TOKEN`. Canvas callbacks can post the
                    certificate link back into the configured assignment submission.
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between rounded border border-base-200 bg-base-200/40 px-4 py-3">
                <div>
                  <p className="font-bold text-base-content">Auto-generate PDF</p>
                  <p className="text-sm text-base-content/55">
                    Return a PDF URL immediately for single certificate flows.
                  </p>
                </div>
                <label className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded">
                  <input
                    type="checkbox"
                    checked={form.autoGeneratePdf}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        autoGeneratePdf: event.target.checked,
                      }))
                    }
                    className="toggle toggle-primary"
                  />
                </label>
              </label>
            </div>

            {actionError && (
              <div className="mt-4 rounded border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary rounded px-6 font-bold"
                disabled={isSaving || templates.length === 0}
                whileHover={isSaving || templates.length === 0 ? undefined : { y: -2 }}
                whileTap={isSaving || templates.length === 0 ? undefined : TAP_PRESS}
                transition={QUICK_SPRING}
              >
                {isSaving ? <span className="loading loading-spinner loading-xs" /> : <Plus size={16} />}
                {editingId ? 'Save Changes' : 'Create Integration'}
              </motion.button>
              <motion.button
                type="button"
                onClick={resetForm}
                className="btn btn-ghost rounded px-5 font-bold"
                whileHover={{ y: -2 }}
                whileTap={TAP_PRESS}
                transition={QUICK_SPRING}
              >
                Reset
              </motion.button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded border border-base-200 bg-base-100 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-base-content/35">
                    Live workspace connections
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                    Managed integrations
                  </h2>
                </div>
                <div className="rounded bg-base-200 p-3 text-base-content/70">
                  <Shield size={18} />
                </div>
              </div>

              {isLoading ? (
                <div className="mt-6 space-y-3">
                  <div className="skeleton h-24 w-full rounded" />
                  <div className="skeleton h-24 w-full rounded" />
                </div>
              ) : error ? (
                <div className="mt-6 rounded border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              ) : integrations.length === 0 ? (
                <div className="mt-6 rounded border border-dashed border-base-300 bg-base-200/30 px-6 py-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-primary/10 text-primary">
                    <Webhook size={22} />
                  </div>
                  <h3 className="text-lg font-black text-base-content">No integrations yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/55">
                    Create your first connection to start receiving webhook-driven certificate requests.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {integrations.map((integration) => (
                    <motion.article
                      key={integration._id}
                      className={`rounded border p-5 ${
                        selectedId === integration._id
                          ? 'border-primary/40 bg-primary/5 shadow-sm'
                          : 'border-base-200 bg-base-100 hover:border-base-300'
                      }`}
                      whileHover={{ y: -4 }}
                      transition={SOFT_SPRING}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <motion.button
                              type="button"
                              onClick={() => {
                                setSelectedId(integration._id);
                                setGuideProvider(integration.provider);
                              }}
                              className="flex min-h-[44px] items-center text-left"
                              whileHover={{ x: 2 }}
                              whileTap={TAP_PRESS}
                              transition={QUICK_SPRING}
                            >
                              <h3 className="text-xl font-black tracking-tight text-base-content break-words max-w-full">
                                {integration.name}
                              </h3>
                            </motion.button>
                            <div className="flex flex-wrap gap-2">
                              <span className="badge badge-outline border-primary/20 bg-primary/5 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                                {integration.provider.replace('_', ' ')}
                              </span>
                              <span
                                className={`badge px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                                  integration.status === 'active'
                                    ? 'badge-success'
                                    : 'badge-ghost text-base-content/50'
                                }`}
                              >
                                {integration.status}
                              </span>
                              <span className="badge badge-ghost px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-base-content/55">
                                {integration.mode}
                              </span>
                              {integration.settings.googleSheets?.enabled && (
                                <span className="badge badge-outline border-primary/20 bg-primary/5 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                                  Sheets sync
                                </span>
                              )}
                              {integration.settings.canvas?.enabled && (
                                <span className="badge badge-outline border-accent/20 bg-accent/10 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-accent">
                                  Canvas handoff
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="max-w-2xl text-sm leading-relaxed text-base-content/60">
                            {integration.description || 'No workflow notes added yet.'}
                          </p>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded bg-base-200/50 px-3 py-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                                Template
                              </p>
                              <p className="mt-1 text-sm font-bold text-base-content">
                                {integration.templateName || 'Unknown template'}
                              </p>
                            </div>
                            <div className="rounded bg-base-200/50 px-3 py-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                                Runs
                              </p>
                              <p className="mt-1 text-sm font-bold text-base-content">
                                {integration.stats.totalRuns} total
                              </p>
                            </div>
                            <div className="rounded bg-base-200/50 px-3 py-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                                Last success
                              </p>
                              <p className="mt-1 text-sm font-bold text-base-content">
                                {formatRelativeTime(integration.stats.lastSuccessfulRunAt)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded border border-base-200 bg-base-100 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                              Webhook URL
                            </p>
                            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <code className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-base-content/70">
                                {integration.webhookUrl}
                              </code>
                              <motion.button
                                type="button"
                                onClick={() => handleCopyWebhook(integration)}
                                className="btn btn-sm btn-ghost rounded px-3 font-bold"
                                whileHover={{ y: -2 }}
                                whileTap={TAP_PRESS}
                                transition={QUICK_SPRING}
                              >
                                {copiedWebhookId === integration._id ? <Check size={15} /> : <Copy size={15} />}
                                {copiedWebhookId === integration._id ? 'Copied' : 'Copy'}
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <motion.button
                            type="button"
                            onClick={() => handleTest(integration)}
                            className="btn btn-sm btn-primary rounded px-4 font-bold"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            <Play size={14} />
                            Test
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleEdit(integration)}
                            className="btn btn-sm btn-ghost rounded px-4 font-bold"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            <FileText size={14} />
                            Edit
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleToggleStatus(integration)}
                            className="btn btn-sm btn-ghost rounded px-4 font-bold"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            {integration.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                            {integration.status === 'active' ? 'Pause' : 'Activate'}
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleDelete(integration._id)}
                            className="btn btn-sm btn-ghost rounded px-4 font-bold text-error hover:bg-error/10 hover:text-error"
                            whileHover={{ y: -2 }}
                            whileTap={TAP_PRESS}
                            transition={QUICK_SPRING}
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </div>

                      {integration.stats.lastError && (
                        <div className="mt-4 rounded border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning-content">
                          Last error: {integration.stats.lastError}
                        </div>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded border border-base-200 bg-base-100 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-base-content/35">
                    Playbook
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                    Ship-ready webhook instructions
                  </h2>
                </div>
                <div className="rounded bg-accent/10 p-3 text-accent">
                  <Sparkles size={18} />
                </div>
              </div>

              {selectedIntegration && activePlaybook ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded border border-base-200 bg-base-200/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                      Selected workflow
                    </p>
                    <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-base-content">
                          {selectedIntegration.name}
                        </h3>
                        <p className="text-sm text-base-content/55">
                          {selectedIntegration.templateName || 'Unknown template'} |{' '}
                          {selectedIntegration.mode} mode
                        </p>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/60">
                          {activePlaybookGuide.setupLead}
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => handleTest(selectedIntegration)}
                        className="btn btn-outline rounded px-4 font-bold"
                        whileHover={{ y: -2 }}
                        whileTap={TAP_PRESS}
                        transition={QUICK_SPRING}
                      >
                        Run Setup Test
                        <ArrowRight size={15} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded border border-base-200 bg-base-100">
                      <div className="border-b border-base-200 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                          Sample payload
                        </p>
                      </div>
                      <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-base-content/75">
{JSON.stringify(activePlaybook.samplePayload, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded border border-base-200 bg-base-100 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                          Integration endpoint
                        </p>
                        <code className="mt-3 block break-all text-xs text-base-content/75">
                          {selectedIntegration.webhookUrl}
                        </code>
                      </div>

                      <div className="rounded border border-base-200 bg-base-100 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                          Curl test
                        </p>
                        <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-base-content/75">
{activePlaybook.sampleCurl}
                        </pre>
                      </div>

                      <div className="rounded border border-primary/20 bg-primary/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          Rollout notes
                        </p>
                        <div className="mt-3 space-y-2 text-sm leading-relaxed text-base-content/65">
                          {activePlaybook.notes.map((note) => (
                            <div key={note} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {activePlaybook.nativeChecks && activePlaybook.nativeChecks.length > 0 && (
                        <div className="rounded border border-base-200 bg-base-100 p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                            Native connector checks
                          </p>
                          <div className="mt-3 space-y-3">
                            {activePlaybook.nativeChecks.map((checkItem) => (
                              <div
                                key={`${checkItem.label}-${checkItem.detail}`}
                                className="rounded border border-base-200 bg-base-200/35 px-4 py-3"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-base-content">{checkItem.label}</p>
                                  <span
                                    className={`badge px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                                      checkItem.status === 'configured'
                                        ? 'badge-success'
                                        : checkItem.status === 'failed'
                                          ? 'badge-error'
                                          : 'badge-ghost text-base-content/55'
                                    }`}
                                  >
                                    {checkItem.status}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                                  {checkItem.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded border border-base-200 bg-base-100 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/35">
                          Provider QA checks
                        </p>
                        <div className="mt-3 space-y-2 text-sm leading-relaxed text-base-content/65">
                          {activePlaybookGuide.qaChecks.map((checkItem) => (
                            <div key={checkItem} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-base-content/30" />
                              <span>{checkItem}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded border border-dashed border-base-300 bg-base-200/30 px-6 py-10 text-center">
                  <p className="text-lg font-black text-base-content">
                    Select an integration to preview its payload and rollout instructions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};
