import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Webhook } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDemo } from '@/context/DemoContext';
import { useTemplates } from '@/hooks/useTemplates';
import { INTEGRATION_CATALOG } from '@/utils/integrationCatalog';
import { GOOGLE_SHEETS_DEFAULT_MAPPING } from '@/utils/integrationSpotlights';
import {
  createIntegration,
  deleteIntegration,
  fetchIntegrationCatalog,
  fetchIntegrations,
  updateIntegration,
} from '@/utils/integrationApi';
import { SOFT_SPRING } from '@/utils/motion';
import {
  IntegrationTabs,
  IntegrationOverview,
  IntegrationCreateWizard,
  IntegrationManage,
  IntegrationDocumentation,
} from '@/components/integration';
import type {
  CanvasCompletionPreset,
  CanvasReturnMode,
  CreateIntegrationDto,
  Integration,
  IntegrationCatalogItem,
  IntegrationMode,
  IntegrationProvider,
  IntegrationStatus,
} from '@/types';
import type { IntegrationTabId } from '@/components/integration';

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
  googleSheetsSheetName: 'Ready to Create',
  googleSheetsStatusColumn: GOOGLE_SHEETS_DEFAULT_MAPPING.statusColumn,
  googleSheetsCertificateIdColumn:
    GOOGLE_SHEETS_DEFAULT_MAPPING.certificateIdColumn,
  googleSheetsPdfUrlColumn: GOOGLE_SHEETS_DEFAULT_MAPPING.pdfUrlColumn,
  googleSheetsBatchJobIdColumn: 'Certify Job ID',
  googleSheetsProcessedAtColumn: 'Processed At',
  canvasEnabled: false,
  canvasBaseUrl: '',
  canvasCourseId: '',
  canvasAssignmentId: '',
  canvasModuleId: '',
  canvasCompletionPreset: 'course_completion',
  canvasReturnMode: 'submission_comment',
});

const buildPayloadFromForm = (
  form: IntegrationFormState
): CreateIntegrationDto => ({
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
      enabled:
        form.provider === 'google_sheets' ? form.googleSheetsEnabled : false,
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

const buildFormFromIntegration = (
  integration: Integration
): IntegrationFormState => ({
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
  googleSheetsEnabled:
    integration.settings.googleSheets?.enabled ??
    integration.provider === 'google_sheets',
  googleSheetsSpreadsheetId:
    integration.settings.googleSheets?.spreadsheetId || '',
  googleSheetsSheetName:
    integration.settings.googleSheets?.sheetName || 'Ready to Create',
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
    integration.settings.googleSheets?.batchJobIdColumn || 'Certify Job ID',
  googleSheetsProcessedAtColumn:
    integration.settings.googleSheets?.processedAtColumn || 'Processed At',
  canvasEnabled:
    integration.settings.canvas?.enabled ?? integration.provider === 'canvas',
  canvasBaseUrl: integration.settings.canvas?.baseUrl || '',
  canvasCourseId: integration.settings.canvas?.courseId || '',
  canvasAssignmentId: integration.settings.canvas?.assignmentId || '',
  canvasModuleId: integration.settings.canvas?.moduleId || '',
  canvasCompletionPreset:
    integration.settings.canvas?.completionPreset || 'course_completion',
  canvasReturnMode:
    integration.settings.canvas?.returnMode || 'submission_comment',
});

export const Integrations: React.FC = () => {
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { isDemoMode, mockIntegrations, setMockIntegrations } = useDemo();
  const [catalog, setCatalog] =
    useState<IntegrationCatalogItem[]>(INTEGRATION_CATALOG);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<IntegrationTabId>('overview');
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
          fetchIntegrationCatalog().catch(() => ({
            data: INTEGRATION_CATALOG,
          })),
          fetchIntegrations(),
        ]);

        setCatalog(catalogResult.data || INTEGRATION_CATALOG);
        setIntegrations(integrationResult.data || []);
      } catch (err) {
        setCatalog(INTEGRATION_CATALOG);
        setError(
          err instanceof Error ? err.message : 'Failed to load integrations.'
        );
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

  const templateNameById = useMemo(
    () => new Map(templates.map((template) => [template._id, template.name])),
    [templates]
  );

  const catalogByProvider = useMemo(
    () => new Map(catalog.map((item) => [item.provider, item])),
    [catalog]
  );

  const activeCount = integrations.filter(
    (integration) => integration.status === 'active'
  ).length;
  const pausedCount = integrations.filter(
    (integration) => integration.status === 'paused'
  ).length;
  const totalRuns = integrations.reduce(
    (sum, integration) => sum + integration.stats.totalRuns,
    0
  );

  const resetForm = () => {
    setEditingId(null);
    setActionError(null);
    setForm(createInitialForm(templates[0]?._id || ''));
  };

  const handleCreateNew = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleEdit = (integration: Integration) => {
    setEditingId(integration._id);
    setForm(buildFormFromIntegration(integration));
    setActiveTab('create');
  };

  const handleCopyWebhook = async (webhookUrl: string) => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
    } catch {
      setActionError('Failed to copy webhook URL.');
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    const nextStatus: IntegrationStatus =
      integration.status === 'active' ? 'paused' : 'active';

    try {
      if (isDemoMode) {
        const next = mockIntegrations.map((item) =>
          item._id === integration._id
            ? {
                ...item,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        setMockIntegrations(next);
        setIntegrations(next);
        return;
      }

      const result = await updateIntegration(integration._id, {
        status: nextStatus,
      });
      if (result.data) {
        setIntegrations((current) =>
          current.map((item) =>
            item._id === integration._id ? result.data! : item
          )
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update status.'
      );
    }
  };

  const handleDelete = async (integrationId: string) => {
    setActionError(null);

    try {
      if (isDemoMode) {
        const next = mockIntegrations.filter(
          (integration) => integration._id !== integrationId
        );
        setMockIntegrations(next);
        setIntegrations(next);
      } else {
        await deleteIntegration(integrationId);
        setIntegrations((current) =>
          current.filter((integration) => integration._id !== integrationId)
        );
      }

      if (editingId === integrationId) {
        resetForm();
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete integration.'
      );
    }
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.templateId) {
      setActionError('Name and template are required.');
      return false;
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
            settings: payload.settings || {
              autoGeneratePdf: form.autoGeneratePdf,
            },
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
        }

        resetForm();
        setActiveTab('manage');
        return true;
      }

      if (editingId) {
        const result = await updateIntegration(
          editingId,
          buildPayloadFromForm(form)
        );
        const updated = result.data;
        if (updated) {
          setIntegrations((current) =>
            current.map((integration) =>
              integration._id === editingId ? updated : integration
            )
          );
        }
      } else {
        const result = await createIntegration(buildPayloadFromForm(form));
        const created = result.data;
        if (created) {
          setIntegrations((current) => [created, ...current]);
        }
      }

      resetForm();
      setActiveTab('manage');
      return true;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to save integration.'
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectProvider = (provider: IntegrationProvider) => {
    const catalogItem = catalogByProvider.get(provider);
    setForm((current) => ({
      ...current,
      provider,
      mode: catalogItem?.recommendedMode || current.mode,
      googleSheetsEnabled:
        provider === 'google_sheets' ? true : current.googleSheetsEnabled,
      canvasEnabled: provider === 'canvas' ? true : current.canvasEnabled,
    }));
    setActiveTab('create');
  };

  const stats = {
    total: integrations.length,
    active: activeCount,
    paused: pausedCount,
    totalRuns,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded border border-base-200 bg-base-100 shadow-sm"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.02),rgba(59,130,246,0.03))]" />
          <div className="relative px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <Webhook size={12} />
                  Integration Center
                </div>
                <h1 className="text-2xl font-black tracking-tight text-base-content md:text-3xl lg:text-4xl">
                  Integrations Hub
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60">
                  Connect your business workflows and automate certificate
                  issuance with Google Sheets, Canvas LMS, and Webhooks.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total', value: stats.total },
                  { label: 'Active', value: stats.active },
                  { label: 'Paused', value: stats.paused },
                  { label: 'Total Runs', value: stats.totalRuns },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="rounded border border-primary/10 bg-primary/5 p-4 shadow-sm text-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SOFT_SPRING, delay: index * 0.04 }}
                    whileHover={{ y: -4 }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-base-content">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <IntegrationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        />

        {activeTab === 'overview' && (
          <IntegrationOverview
            stats={stats}
            onCreateNew={handleCreateNew}
            onSelectProvider={handleSelectProvider}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'create' && (
          <IntegrationCreateWizard
            form={form}
            templates={templates}
            templatesLoading={templatesLoading}
            isEditing={!!editingId}
            isSaving={isSaving}
            error={actionError}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {activeTab === 'manage' && (
          <IntegrationManage
            integrations={integrations}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onCopyWebhook={handleCopyWebhook}
            onCreateNew={handleCreateNew}
          />
        )}

        {activeTab === 'docs' && (
          <IntegrationDocumentation
            onCreateIntegration={handleSelectProvider}
          />
        )}
      </div>
    </MainLayout>
  );
};
