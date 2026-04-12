import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  GraduationCap,
  Code,
  Check,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import { Button } from '@/components/common/Button';
import type { IntegrationFormData } from './integration.types';
import type { IntegrationProvider, Template } from '@/types';
import {
  REVEAL_ITEM,
  STAGGER_CONTAINER,
  QUICK_SPRING,
  TAP_PRESS,
} from '@/utils/motion';

interface IntegrationCreateWizardProps {
  form?: IntegrationFormData;
  templates: Template[];
  templatesLoading?: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  error?: string | null;
  onFormChange?: (field: string, value: string | boolean) => void;
  onSubmit: (data: IntegrationFormData) => Promise<boolean>;
  onCancel: () => void;
}

const initialFormData: IntegrationFormData = {
  name: '',
  provider: 'google_sheets',
  description: '',
  status: 'active',
  mode: 'single',
  templateId: '',
  certificateTitle: '',
  issuerName: '',
  descriptionDefault: '',
  autoGeneratePdf: true,
  googleSheetsEnabled: true,
  googleSheetsSpreadsheetId: '',
  googleSheetsSheetName: 'Sheet1',
  googleSheetsStatusColumn: 'Status',
  googleSheetsCertificateIdColumn: 'CertificateID',
  googleSheetsPdfUrlColumn: 'PdfUrl',
  googleSheetsBatchJobIdColumn: '',
  googleSheetsProcessedAtColumn: '',
  canvasEnabled: false,
  canvasBaseUrl: '',
  canvasCourseId: '',
  canvasAssignmentId: '',
  canvasModuleId: '',
  canvasCompletionPreset: 'course_completion',
  canvasReturnMode: 'response_only',
};

interface FormErrors {
  [key: string]: string;
}

const providerOptions = [
  {
    id: 'google_sheets',
    label: 'Google Sheets',
    description: 'Connect to spreadsheets for batch certificate generation',
    icon: FileSpreadsheet,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  {
    id: 'canvas',
    label: 'Canvas LMS',
    description: 'Integrate with Canvas for course completion certificates',
    icon: GraduationCap,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  {
    id: 'custom',
    label: 'Custom Webhook',
    description: 'Set up a custom webhook for your own systems',
    icon: Code,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
];

export const IntegrationCreateWizard: React.FC<
  IntegrationCreateWizardProps
> = ({
  form: externalForm,
  templates,
  templatesLoading: _templatesLoading,
  isEditing: _isEditing,
  isSaving: _isSaving,
  error: _externalError,
  onFormChange,
  onSubmit,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [internalFormData, setInternalFormData] =
    useState<IntegrationFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData = externalForm || internalFormData;

  const steps = [
    { id: 0, title: 'Provider', description: 'Choose your integration type' },
    { id: 1, title: 'Details', description: 'Basic information' },
    { id: 2, title: 'Template', description: 'Select certificate template' },
    { id: 3, title: 'Configure', description: 'Provider settings' },
    { id: 4, title: 'Review', description: 'Confirm and create' },
  ];

  const updateField = <K extends keyof IntegrationFormData>(
    field: K,
    value: IntegrationFormData[K]
  ) => {
    if (onFormChange) {
      onFormChange(field, value as string | boolean);
    } else {
      setInternalFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0:
        if (!formData.provider) {
          newErrors.provider = 'Please select a provider';
        }
        break;
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Integration name is required';
        }
        if (!formData.mode) {
          newErrors.mode = 'Please select a mode';
        }
        break;
      case 2:
        if (!formData.templateId) {
          newErrors.templateId = 'Please select a template';
        }
        break;
      case 3:
        if (formData.provider === 'google_sheets') {
          if (!formData.googleSheetsSpreadsheetId.trim()) {
            newErrors.googleSheetsSpreadsheetId = 'Spreadsheet ID is required';
          }
        } else if (formData.provider === 'canvas') {
          if (!formData.canvasBaseUrl.trim()) {
            newErrors.canvasBaseUrl = 'Canvas URL is required';
          }
          if (!formData.canvasCourseId.trim()) {
            newErrors.canvasCourseId = 'Course ID is required';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (_error) {
      setErrors({ submit: 'Failed to create integration. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-base-content">
                Select Integration Type
              </h3>
              <p className="text-sm text-base-content/60">
                Choose the platform you want to connect with
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {providerOptions.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    updateField('provider', option.id as IntegrationProvider)
                  }
                  className={`group relative rounded-lg border-2 p-5 text-left transition-all ${
                    formData.provider === option.id
                      ? `${option.borderColor} ${option.bgColor}`
                      : 'border-base-200 hover:border-base-300'
                  }`}
                  variants={REVEAL_ITEM}
                  whileHover={{ y: -2 }}
                  whileTap={TAP_PRESS}
                  transition={QUICK_SPRING}
                >
                  {formData.provider === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute right-3 top-3 rounded-full p-1 ${option.bgColor}`}
                    >
                      <Check size={14} className={option.color} />
                    </motion.div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${option.bgColor}`}>
                      <option.icon size={24} className={option.color} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content">
                        {option.label}
                      </h4>
                      <p className="mt-1 text-sm text-base-content/60">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {errors.provider && (
              <p className="flex items-center gap-2 text-sm text-error">
                <AlertCircle size={14} />
                {errors.provider}
              </p>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-base-content">
                Basic Information
              </h3>
              <p className="text-sm text-base-content/60">
                Provide a name and select the operation mode
              </p>
            </div>

            <motion.div variants={REVEAL_ITEM}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Integration Name <span className="text-error">*</span>
                  </span>
                  <Tooltip
                    content="A descriptive name to identify this integration"
                    position="right"
                  >
                    <HelpCircle size={14} className="text-base-content/40" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Course Completion Certificates"
                  className={`input input-bordered w-full ${
                    errors.name ? 'input-error' : ''
                  }`}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name}
                    </span>
                  </label>
                )}
              </div>
            </motion.div>

            <motion.div variants={REVEAL_ITEM}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                  <span className="label-text-alt text-base-content/50">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of this integration's purpose"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>
            </motion.div>

            <motion.div variants={REVEAL_ITEM}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">
                    Mode <span className="text-error">*</span>
                  </span>
                  <Tooltip
                    content="Single: One certificate per webhook call. Batch: Multiple certificates from a data source."
                    position="right"
                  >
                    <HelpCircle size={14} className="text-base-content/40" />
                  </Tooltip>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateField('mode', 'single')}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      formData.mode === 'single'
                        ? 'border-primary bg-primary/5'
                        : 'border-base-200 hover:border-base-300'
                    }`}
                  >
                    <p className="font-bold text-base-content">Single</p>
                    <p className="text-sm text-base-content/60">
                      One certificate per request
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('mode', 'batch')}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      formData.mode === 'batch'
                        ? 'border-primary bg-primary/5'
                        : 'border-base-200 hover:border-base-300'
                    }`}
                  >
                    <p className="font-bold text-base-content">Batch</p>
                    <p className="text-sm text-base-content/60">
                      Multiple certificates from data source
                    </p>
                  </button>
                </div>
                {errors.mode && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-error">
                    <AlertCircle size={14} />
                    {errors.mode}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-base-content">
                Select Template
              </h3>
              <p className="text-sm text-base-content/60">
                Choose the certificate template for this integration
              </p>
            </div>

            {templates.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/30 p-8 text-center">
                <p className="text-base-content/60">
                  No templates available. Create a template first.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <motion.button
                    key={template._id}
                    type="button"
                    onClick={() => updateField('templateId', template._id)}
                    className={`group rounded-lg border-2 p-4 text-left transition-all ${
                      formData.templateId === template._id
                        ? 'border-primary bg-primary/5'
                        : 'border-base-200 hover:border-base-300'
                    }`}
                    variants={REVEAL_ITEM}
                    whileHover={{ y: -2 }}
                    whileTap={TAP_PRESS}
                    transition={QUICK_SPRING}
                  >
                    {formData.templateId === template._id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-2 rounded-full bg-primary p-1"
                      >
                        <Check size={12} className="text-primary-content" />
                      </motion.div>
                    )}
                    <h4 className="font-bold text-base-content">
                      {template.name}
                    </h4>
                    <p className="mt-1 text-sm text-base-content/60">
                      {template.category}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
            {errors.templateId && (
              <p className="flex items-center gap-2 text-sm text-error">
                <AlertCircle size={14} />
                {errors.templateId}
              </p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-base-content">
                Provider Configuration
              </h3>
              <p className="text-sm text-base-content/60">
                Configure settings for {formData.provider.replace('_', ' ')}
              </p>
            </div>

            {formData.provider === 'google_sheets' && (
              <motion.div variants={REVEAL_ITEM} className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Spreadsheet ID <span className="text-error">*</span>
                    </span>
                    <Tooltip
                      content="Found in your Google Sheets URL: /d/SPREADSHEET_ID/edit"
                      position="right"
                    >
                      <HelpCircle size={14} className="text-base-content/40" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={formData.googleSheetsSpreadsheetId}
                    onChange={(e) =>
                      updateField('googleSheetsSpreadsheetId', e.target.value)
                    }
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className={`input input-bordered w-full ${
                      errors.googleSheetsSpreadsheetId ? 'input-error' : ''
                    }`}
                  />
                  {errors.googleSheetsSpreadsheetId && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.googleSheetsSpreadsheetId}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Sheet Name</span>
                    <span className="label-text-alt text-base-content/50">
                      (default: Sheet1)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.googleSheetsSheetName}
                    onChange={(e) =>
                      updateField('googleSheetsSheetName', e.target.value)
                    }
                    placeholder="Sheet1"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="rounded-lg border border-base-200 bg-base-200/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                    Column Mapping
                  </p>
                  <p className="mt-1 text-sm text-base-content/60">
                    These columns will be auto-created if they don't exist in
                    your sheet.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">
                          Status Column
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.googleSheetsStatusColumn}
                        onChange={(e) =>
                          updateField(
                            'googleSheetsStatusColumn',
                            e.target.value
                          )
                        }
                        placeholder="Status"
                        className="input input-bordered input-sm w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">
                          Certificate ID Column
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.googleSheetsCertificateIdColumn}
                        onChange={(e) =>
                          updateField(
                            'googleSheetsCertificateIdColumn',
                            e.target.value
                          )
                        }
                        placeholder="Certificate ID"
                        className="input input-bordered input-sm w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">
                          PDF URL Column
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.googleSheetsPdfUrlColumn}
                        onChange={(e) =>
                          updateField(
                            'googleSheetsPdfUrlColumn',
                            e.target.value
                          )
                        }
                        placeholder="PDF URL"
                        className="input input-bordered input-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {formData.provider === 'canvas' && (
              <motion.div variants={REVEAL_ITEM} className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Canvas URL <span className="text-error">*</span>
                    </span>
                    <Tooltip
                      content="Your Canvas instance base URL (e.g., https://school.instructure.com)"
                      position="right"
                    >
                      <HelpCircle size={14} className="text-base-content/40" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={formData.canvasBaseUrl}
                    onChange={(e) =>
                      updateField('canvasBaseUrl', e.target.value)
                    }
                    placeholder="https://school.instructure.com"
                    className={`input input-bordered w-full ${
                      errors.canvasBaseUrl ? 'input-error' : ''
                    }`}
                  />
                  {errors.canvasBaseUrl && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.canvasBaseUrl}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Course ID <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.canvasCourseId}
                    onChange={(e) =>
                      updateField('canvasCourseId', e.target.value)
                    }
                    placeholder="e.g., 12345"
                    className={`input input-bordered w-full ${
                      errors.canvasCourseId ? 'input-error' : ''
                    }`}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Completion Preset
                    </span>
                    <Tooltip
                      content="When to trigger certificate generation"
                      position="right"
                    >
                      <HelpCircle size={14} className="text-base-content/40" />
                    </Tooltip>
                  </label>
                  <select
                    value={formData.canvasCompletionPreset}
                    onChange={(e) =>
                      updateField(
                        'canvasCompletionPreset',
                        e.target
                          .value as IntegrationFormData['canvasCompletionPreset']
                      )
                    }
                    aria-label="Completion Preset"
                    className="select select-bordered w-full"
                  >
                    <option value="course_completion">Course Completion</option>
                    <option value="module_completion">Module Completion</option>
                    <option value="capstone_completion">
                      Capstone Completion
                    </option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Return Mode</span>
                    <Tooltip
                      content="How to send the certificate back to Canvas"
                      position="right"
                    >
                      <HelpCircle size={14} className="text-base-content/40" />
                    </Tooltip>
                  </label>
                  <select
                    value={formData.canvasReturnMode}
                    onChange={(e) =>
                      updateField(
                        'canvasReturnMode',
                        e.target
                          .value as IntegrationFormData['canvasReturnMode']
                      )
                    }
                    aria-label="Return Mode"
                    className="select select-bordered w-full"
                  >
                    <option value="response_only">Response Only</option>
                    <option value="submission_comment">
                      Submission Comment
                    </option>
                  </select>
                </div>
              </motion.div>
            )}

            {formData.provider === 'custom' && (
              <motion.div variants={REVEAL_ITEM}>
                <div className="rounded-lg border border-base-200 bg-base-200/30 p-6 text-center">
                  <p className="text-base-content/60">
                    Custom webhooks are configured after creation. You'll
                    receive a unique URL to send requests to.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-base-content">
                Review & Create
              </h3>
              <p className="text-sm text-base-content/60">
                Confirm your integration settings
              </p>
            </div>

            <motion.div
              variants={REVEAL_ITEM}
              className="rounded-lg border border-base-200 bg-base-100 p-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between border-b border-base-200 pb-3">
                  <span className="text-sm text-base-content/60">Name</span>
                  <span className="font-medium text-base-content">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-base-200 pb-3">
                  <span className="text-sm text-base-content/60">Provider</span>
                  <span className="font-medium text-base-content">
                    {formData.provider.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-base-200 pb-3">
                  <span className="text-sm text-base-content/60">Mode</span>
                  <span className="font-medium text-base-content capitalize">
                    {formData.mode}
                  </span>
                </div>
                <div className="flex justify-between border-b border-base-200 pb-3">
                  <span className="text-sm text-base-content/60">Template</span>
                  <span className="font-medium text-base-content">
                    {templates.find((t) => t._id === formData.templateId)
                      ?.name || 'Not selected'}
                  </span>
                </div>
                {formData.provider === 'google_sheets' && (
                  <div className="flex justify-between pb-3">
                    <span className="text-sm text-base-content/60">
                      Spreadsheet ID
                    </span>
                    <span className="font-mono text-sm text-base-content">
                      {formData.googleSheetsSpreadsheetId.slice(0, 20)}...
                    </span>
                  </div>
                )}
                {formData.provider === 'canvas' && (
                  <>
                    <div className="flex justify-between border-b border-base-200 pb-3">
                      <span className="text-sm text-base-content/60">
                        Canvas URL
                      </span>
                      <span className="font-medium text-base-content">
                        {formData.canvasBaseUrl}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3">
                      <span className="text-sm text-base-content/60">
                        Course ID
                      </span>
                      <span className="font-medium text-base-content">
                        {formData.canvasCourseId}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {errors.submit && (
              <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">
                {errors.submit}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <motion.div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    index < currentStep
                      ? 'bg-primary text-primary-content'
                      : index === currentStep
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200 text-base-content/50'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                  }}
                  transition={QUICK_SPRING}
                >
                  {index < currentStep ? <Check size={18} /> : index + 1}
                </motion.div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    index <= currentStep
                      ? 'text-base-content'
                      : 'text-base-content/50'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    index < currentStep ? 'bg-primary' : 'bg-base-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-base-200 pt-6">
        <Button
          variant="ghost"
          onClick={currentStep === 0 ? onCancel : handleBack}
          leftIcon={currentStep === 0 ? undefined : <ArrowLeft size={16} />}
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={<ArrowRight size={16} />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check size={16} />}
          >
            Create Integration
          </Button>
        )}
      </div>
    </div>
  );
};
