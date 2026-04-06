import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  Grip,
  ImagePlus,
  Info,
  LayoutTemplate,
  Move,
  Palette,
  Save,
  Sparkles,
  Type,
  Wand2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { FileUpload } from '@/components/common/FileUpload';
import { Input } from '@/components/common/Input';
import { useCloudinary } from '@/hooks/useCloudinary';
import { post } from '@/utils/api';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, ROUTES, TEMPLATE_CATEGORIES } from '@/utils/constants';
import type { Template } from '@/types';
import type { ApiResponse } from '@/types/api';
import type {
  TemplateField,
  TemplateFieldStyle,
  TemplateFieldTextAlign,
  TemplateMode,
} from '@/types/template';
import { REVEAL_ITEM, SOFT_SPRING, STAGGER_CONTAINER, TAP_PRESS } from '@/utils/motion';

const PRESET_TEMPLATES = [
  {
    value: 'certificate-modern',
    label: 'Modern Professional',
    preview: 'Clean hierarchy with a polished corporate rhythm.',
  },
  {
    value: 'certificate-classic',
    label: 'Classic Academic',
    preview: 'Formal border treatment for schools and institutions.',
  },
  {
    value: 'certificate-base',
    label: 'Event Achievement',
    preview: 'Punchier presentation for awards, workshops, and events.',
  },
] as const;

const FONT_OPTIONS = [
  'Georgia, serif',
  '"Times New Roman", serif',
  'Arial, sans-serif',
  '"Trebuchet MS", sans-serif',
  'Garamond, serif',
] as const;

const createPreviewAsset = (label: string, background: string, foreground: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320">
      <rect width="640" height="320" rx="28" fill="${background}" />
      <text
        x="320"
        y="180"
        text-anchor="middle"
        fill="${foreground}"
        font-family="Arial, sans-serif"
        font-size="82"
        font-weight="700"
        letter-spacing="10"
      >
        ${label}
      </text>
    </svg>
  `)}`;

const SAMPLE_PREVIEW_DATA = {
  recipientName: 'Alex Morgan',
  certificateTitle: 'Certificate of Outstanding Completion',
  description: 'Presented for successfully completing the Advanced Product Systems Program.',
  issueDate: 'April 6, 2026',
  expiryDate: 'April 6, 2027',
  issuerName: 'Certify Academy',
  certificateId: 'CERT-2026-0421',
  organizationLogo: createPreviewAsset('LOGO', '#0F172A', '#F8FAFC'),
  issuerSignature: createPreviewAsset('SIGN', '#FFFFFF', '#1E293B'),
};

const DEFAULT_BACKGROUND_FIELDS: TemplateField[] = [
  {
    name: 'certificateTitle',
    label: 'Certificate Title',
    type: 'text',
    required: true,
    visible: true,
    defaultValue: SAMPLE_PREVIEW_DATA.certificateTitle,
    position: { x: 50, y: 24 },
    size: { width: 66 },
    style: {
      fontSize: 32,
      fontWeight: 700,
      fontFamily: 'Georgia, serif',
      color: '#0F172A',
      textAlign: 'center',
      lineHeight: 1.15,
      letterSpacing: 0.8,
      fontStyle: 'normal',
      textTransform: 'uppercase',
    },
  },
  {
    name: 'recipientName',
    label: 'Recipient Name',
    type: 'text',
    required: true,
    visible: true,
    defaultValue: SAMPLE_PREVIEW_DATA.recipientName,
    position: { x: 50, y: 48 },
    size: { width: 58 },
    style: {
      fontSize: 34,
      fontWeight: 700,
      fontFamily: 'Garamond, serif',
      color: '#111827',
      textAlign: 'center',
      lineHeight: 1.1,
      letterSpacing: 0.2,
      fontStyle: 'italic',
      textTransform: 'none',
    },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: false,
    visible: true,
    defaultValue: SAMPLE_PREVIEW_DATA.description,
    position: { x: 50, y: 61 },
    size: { width: 72 },
    style: {
      fontSize: 16,
      fontWeight: 500,
      fontFamily: 'Arial, sans-serif',
      color: '#334155',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      fontStyle: 'normal',
      textTransform: 'none',
    },
  },
  {
    name: 'issueDate',
    label: 'Issue Date',
    type: 'date',
    required: true,
    visible: true,
    defaultValue: SAMPLE_PREVIEW_DATA.issueDate,
    position: { x: 18, y: 82 },
    size: { width: 24 },
    style: {
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      color: '#1F2937',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0.2,
      fontStyle: 'normal',
      textTransform: 'uppercase',
    },
  },
  {
    name: 'expiryDate',
    label: 'Expiry Date',
    type: 'date',
    required: false,
    visible: false,
    defaultValue: SAMPLE_PREVIEW_DATA.expiryDate,
    position: { x: 50, y: 82 },
    size: { width: 24 },
    style: {
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      color: '#1F2937',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0.2,
      fontStyle: 'normal',
      textTransform: 'uppercase',
    },
  },
  {
    name: 'issuerName',
    label: 'Issuer Name',
    type: 'text',
    required: true,
    visible: true,
    defaultValue: SAMPLE_PREVIEW_DATA.issuerName,
    position: { x: 81, y: 82 },
    size: { width: 24 },
    style: {
      fontSize: 16,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      color: '#111827',
      textAlign: 'right',
      lineHeight: 1.2,
      letterSpacing: 0,
      fontStyle: 'normal',
      textTransform: 'none',
    },
  },
  {
    name: 'certificateId',
    label: 'Certificate ID',
    type: 'text',
    required: false,
    visible: false,
    defaultValue: SAMPLE_PREVIEW_DATA.certificateId,
    position: { x: 86, y: 12 },
    size: { width: 22 },
    style: {
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      color: '#475569',
      textAlign: 'right',
      lineHeight: 1.2,
      letterSpacing: 1.2,
      fontStyle: 'normal',
      textTransform: 'uppercase',
    },
  },
  {
    name: 'organizationLogo',
    label: 'Organization Logo',
    type: 'image',
    required: false,
    visible: false,
    defaultValue: SAMPLE_PREVIEW_DATA.organizationLogo,
    position: { x: 16, y: 15 },
    size: { width: 14, height: 12 },
  },
  {
    name: 'issuerSignature',
    label: 'Issuer Signature',
    type: 'image',
    required: false,
    visible: false,
    defaultValue: SAMPLE_PREVIEW_DATA.issuerSignature,
    position: { x: 79, y: 73 },
    size: { width: 18, height: 10 },
  },
];

interface FormState {
  name: string;
  description: string;
  category: string;
  mode: TemplateMode;
  htmlContent: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundImageUrl: string;
  fields: TemplateField[];
}

type FormErrors = Partial<Record<'name' | 'category' | 'backgroundImageUrl' | 'fields', string>>;

const cloneFields = (): TemplateField[] =>
  DEFAULT_BACKGROUND_FIELDS.map((field) => ({
    ...field,
    position: { ...field.position },
    size: field.size ? { ...field.size } : undefined,
    style: field.style ? { ...field.style } : undefined,
  }));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolvePreviewValue = (field: TemplateField): string => {
  const sampleValue = SAMPLE_PREVIEW_DATA[field.name as keyof typeof SAMPLE_PREVIEW_DATA];
  return typeof sampleValue === 'string' ? sampleValue : field.defaultValue || '';
};

const getTextAlignButtonClass = (isActive: boolean) =>
  isActive ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline';

export const TemplateBuilder: React.FC = () => {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const dragFieldRef = useRef<string | null>(null);
  const { upload, isUploading, error: uploadError } = useCloudinary();

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    category: 'corporate',
    mode: 'preset',
    htmlContent: 'certificate-modern',
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR,
    backgroundImageUrl: '',
    fields: cloneFields(),
  });
  const [selectedFieldName, setSelectedFieldName] = useState<string>('recipientName');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visibleFieldCount = useMemo(
    () => form.fields.filter((field) => field.visible !== false).length,
    [form.fields]
  );
  const selectedField = useMemo(
    () => form.fields.find((field) => field.name === selectedFieldName) ?? form.fields[0],
    [form.fields, selectedFieldName]
  );
  const selectedPreset = useMemo(
    () => PRESET_TEMPLATES.find((template) => template.value === form.htmlContent),
    [form.htmlContent]
  );

  useEffect(() => {
    if (!selectedField) {
      return;
    }

    if (!form.fields.some((field) => field.name === selectedField.name)) {
      setSelectedFieldName(form.fields[0]?.name || 'recipientName');
    }
  }, [form.fields, selectedField]);

  const setFormValue = useCallback((key: keyof FormState, value: string | TemplateField[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as keyof FormErrors]: undefined }));
  }, []);

  const updateField = useCallback((fieldName: string, updater: (field: TemplateField) => TemplateField) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.name === fieldName ? updater(field) : field)),
    }));
    setErrors((prev) => ({ ...prev, fields: undefined }));
  }, []);

  const updateSelectedFieldStyle = useCallback(
    <K extends keyof TemplateFieldStyle>(key: K, value: TemplateFieldStyle[K]) => {
      if (!selectedField) {
        return;
      }

      updateField(selectedField.name, (field) => ({
        ...field,
        style: {
          ...field.style,
          [key]: value,
        },
      }));
    },
    [selectedField, updateField]
  );

  const syncDraggedField = useCallback(
    (clientX: number, clientY: number) => {
      const fieldName = dragFieldRef.current;
      if (!fieldName || !previewRef.current) {
        return;
      }

      const rect = previewRef.current.getBoundingClientRect();
      const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

      updateField(fieldName, (field) => ({
        ...field,
        position: { x, y },
      }));
    },
    [updateField]
  );

  const handleBackgroundUpload = async (file: File) => {
    const result = await upload(file, 'template-backgrounds');
    if (result) {
      setFormValue('backgroundImageUrl', result.secure_url);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, fieldName: string) => {
    dragFieldRef.current = fieldName;
    setSelectedFieldName(fieldName);
    event.currentTarget.setPointerCapture(event.pointerId);
    syncDraggedField(event.clientX, event.clientY);
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragFieldRef.current) {
      return;
    }
    syncDraggedField(event.clientX, event.clientY);
  };

  const handlePreviewPointerUp = () => {
    dragFieldRef.current = null;
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Template name is required.';
    }

    if (!form.category) {
      nextErrors.category = 'Category is required.';
    }

    if (form.mode === 'background') {
      if (!form.backgroundImageUrl) {
        nextErrors.backgroundImageUrl = 'Upload a background image before publishing.';
      }

      if (visibleFieldCount === 0) {
        nextErrors.fields = 'At least one visible field is required.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload =
        form.mode === 'background'
          ? {
              name: form.name,
              description: form.description,
              category: form.category,
              mode: 'background' as const,
              backgroundImageUrl: form.backgroundImageUrl,
              fields: form.fields,
            }
          : {
              name: form.name,
              description: form.description,
              category: form.category,
              mode: 'preset' as const,
              htmlContent: form.htmlContent,
              primaryColor: form.primaryColor,
              secondaryColor: form.secondaryColor,
            };

      const response = await post<Template>('/templates', payload);
      const result = response as ApiResponse<Template>;

      if (!result.data) {
        throw new Error('Template was saved without a response payload.');
      }

      navigate(ROUTES.TEMPLATES);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="mb-10"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                <Sparkles size={14} />
                Template Studio
              </div>
              <h1 className="text-4xl font-black tracking-tight text-base-content md:text-5xl">
                Background Template Builder
              </h1>
              <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-base-content/60">
                Keep preset themes for quick work, or import a Canva-ready background, place your
                data fields, and publish a reusable template for CSV or Excel batch PDF exports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                className="h-12 rounded-sm font-black uppercase tracking-widest"
                onClick={() => navigate(ROUTES.TEMPLATES)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-12 rounded-sm px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                rightIcon={<Save size={18} />}
                onClick={handleSave}
                isLoading={isSaving}
              >
                Publish Template
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.section
              variants={REVEAL_ITEM}
              className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2.5 text-primary">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-base-content">
                  Identity & Metadata
                </h2>
              </div>

              <div className="space-y-6">
                <Input
                  label="Template Name"
                  placeholder="e.g. Canva Masterclass Completion"
                  value={form.name}
                  onChange={(event) => setFormValue('name', event.target.value)}
                  error={errors.name}
                />

                <div className="form-control">
                  <label className="label" htmlFor="template-description">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    id="template-description"
                    className="textarea textarea-bordered min-h-[120px] rounded"
                    placeholder="Describe when this template should be used and what makes it special."
                    value={form.description}
                    onChange={(event) => setFormValue('description', event.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="template-category">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    id="template-category"
                    className="select select-bordered rounded"
                    value={form.category}
                    onChange={(event) => setFormValue('category', event.target.value)}
                  >
                    {TEMPLATE_CATEGORIES.filter((category) => category.value !== 'all').map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category ? (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.category}</span>
                    </label>
                  ) : null}
                </div>
              </div>
            </motion.section>

            {form.mode === 'preset' ? (
              <>
                <motion.section
                  variants={REVEAL_ITEM}
                  className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm"
                >
                  <div className="mb-8 flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2.5 text-primary">
                      <LayoutTemplate size={20} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-base-content">
                      Base Architecture
                    </h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {PRESET_TEMPLATES.map((template) => {
                      const isActive = form.htmlContent === template.value;

                      return (
                        <motion.button
                          key={template.value}
                          type="button"
                          onClick={() => setFormValue('htmlContent', template.value)}
                          whileTap={TAP_PRESS}
                          className={`card items-start rounded border p-5 text-left transition-colors ${
                            isActive
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                              : 'border-base-200 hover:border-primary/30'
                          }`}
                        >
                          <p className="text-base font-black text-base-content">{template.label}</p>
                          <p className="mt-2 text-sm leading-relaxed text-base-content/55">
                            {template.preview}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.section>

                <motion.section
                  variants={REVEAL_ITEM}
                  className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm"
                >
                  <div className="mb-8 flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2.5 text-primary">
                      <Palette size={20} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-base-content">
                      Brand Visual System
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      { key: 'primaryColor' as const, label: 'Primary Color' },
                      { key: 'secondaryColor' as const, label: 'Accent Color' },
                    ].map((colorField) => (
                      <div
                        key={colorField.key}
                        className="rounded border border-base-200 bg-base-200/30 p-4"
                      >
                        <label className="mb-3 block text-xs font-black uppercase tracking-widest text-base-content/35">
                          {colorField.label}
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={form[colorField.key]}
                            onChange={(event) => setFormValue(colorField.key, event.target.value)}
                            className="h-12 w-12 cursor-pointer rounded border border-base-300 bg-transparent"
                          />
                          <Input
                            label=""
                            value={form[colorField.key]}
                            onChange={(event) => setFormValue(colorField.key, event.target.value)}
                            className="font-mono uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </>
            ) : (
              <>
                <motion.section
                  variants={REVEAL_ITEM}
                  className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm"
                >
                  <div className="mb-8 flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2.5 text-primary">
                      <ImagePlus size={20} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-base-content">
                      Background Import
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded border border-info/30 bg-info/10 p-4 text-sm leading-relaxed text-base-content/70">
                      Export your certificate art from Canva or any design tool as a landscape PNG
                      in A4 ratio. Then place the live fields here so users can batch-fill names,
                      dates, IDs, and logos before exporting PDFs.
                    </div>

                    <FileUpload
                      label="Background PNG"
                      accept="image/png,image/jpeg,image/webp"
                      maxSizeBytes={5 * 1024 * 1024}
                      onFileSelect={handleBackgroundUpload}
                      previewUrl={form.backgroundImageUrl || undefined}
                      hint="Recommended: A4 landscape canvas, high-resolution PNG"
                      isUploading={isUploading}
                      error={errors.backgroundImageUrl || uploadError || undefined}
                    />
                  </div>
                </motion.section>

                <motion.section
                  variants={REVEAL_ITEM}
                  className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm"
                >
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-primary/10 p-2.5 text-primary">
                        <Move size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-base-content">
                          Dynamic Fields
                        </h2>
                        <p className="text-sm text-base-content/55">
                          Toggle what Certify should inject. Then drag visible fields directly on
                          the preview canvas.
                        </p>
                      </div>
                    </div>

                    <div className="rounded border border-base-200 bg-base-200/40 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                        Live Placement
                      </p>
                      <p className="mt-1 text-lg font-black text-base-content">
                        {visibleFieldCount} visible field{visibleFieldCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-3">
                      {form.fields.map((field) => {
                        const isSelected = selectedField?.name === field.name;

                        return (
                          <button
                            key={field.name}
                            type="button"
                            onClick={() => setSelectedFieldName(field.name)}
                            className={`flex w-full items-center justify-between rounded border px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-base-200 hover:border-primary/25'
                            }`}
                          >
                            <div>
                              <p className="text-sm font-black text-base-content">{field.label}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-base-content/35">
                                {field.type} field
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={field.visible !== false}
                              onChange={() =>
                                updateField(field.name, (currentField) => ({
                                  ...currentField,
                                  visible: !(currentField.visible !== false),
                                }))
                              }
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Toggle ${field.label}`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-5 rounded border border-base-200 bg-base-200/25 p-5">
                      <div className="flex items-center gap-2">
                        <Type size={16} className="text-primary" />
                        <p className="text-sm font-black uppercase tracking-widest text-base-content/40">
                          Selected Field Controls
                        </p>
                      </div>

                      {selectedField ? (
                        <>
                          <Input
                            label="Field Label"
                            value={selectedField.label}
                            onChange={(event) =>
                              updateField(selectedField.name, (field) => ({
                                ...field,
                                label: event.target.value,
                              }))
                            }
                          />

                          <Input
                            label="Fallback / Preview Text"
                            value={selectedField.defaultValue || ''}
                            onChange={(event) =>
                              updateField(selectedField.name, (field) => ({
                                ...field,
                                defaultValue: event.target.value,
                              }))
                            }
                            hint="Used for preview and when a live value is missing."
                          />

                          <div className="grid gap-4 md:grid-cols-3">
                            <Input
                              label="X Position (%)"
                              type="number"
                              value={Math.round(selectedField.position.x)}
                              onChange={(event) =>
                                updateField(selectedField.name, (field) => ({
                                  ...field,
                                  position: {
                                    ...field.position,
                                    x: clamp(Number(event.target.value) || 0, 0, 100),
                                  },
                                }))
                              }
                            />
                            <Input
                              label="Y Position (%)"
                              type="number"
                              value={Math.round(selectedField.position.y)}
                              onChange={(event) =>
                                updateField(selectedField.name, (field) => ({
                                  ...field,
                                  position: {
                                    ...field.position,
                                    y: clamp(Number(event.target.value) || 0, 0, 100),
                                  },
                                }))
                              }
                            />
                            <Input
                              label="Width (%)"
                              type="number"
                              value={Math.round(selectedField.size?.width ?? 32)}
                              onChange={(event) =>
                                updateField(selectedField.name, (field) => ({
                                  ...field,
                                  size: {
                                    ...(field.size || {}),
                                    width: clamp(Number(event.target.value) || 0, 8, 100),
                                  },
                                }))
                              }
                            />
                          </div>

                          {selectedField.type === 'image' ? (
                            <Input
                              label="Height (%)"
                              type="number"
                              value={Math.round(selectedField.size?.height ?? 12)}
                              onChange={(event) =>
                                updateField(selectedField.name, (field) => ({
                                  ...field,
                                  size: {
                                    width: field.size?.width ?? 18,
                                    height: clamp(Number(event.target.value) || 0, 5, 60),
                                  },
                                }))
                              }
                            />
                          ) : (
                            <>
                              <div className="grid gap-4 md:grid-cols-2">
                                <Input
                                  label="Font Size (px)"
                                  type="number"
                                  value={Math.round(selectedField.style?.fontSize ?? 24)}
                                  onChange={(event) =>
                                    updateSelectedFieldStyle(
                                      'fontSize',
                                      clamp(Number(event.target.value) || 0, 10, 96)
                                    )
                                  }
                                />
                                <Input
                                  label="Font Weight"
                                  type="number"
                                  value={Math.round(selectedField.style?.fontWeight ?? 600)}
                                  onChange={(event) =>
                                    updateSelectedFieldStyle(
                                      'fontWeight',
                                      clamp(Number(event.target.value) || 0, 300, 900)
                                    )
                                  }
                                />
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="form-control">
                                  <label className="label" htmlFor="field-font-family">
                                    <span className="label-text font-medium">Font Family</span>
                                  </label>
                                  <select
                                    id="field-font-family"
                                    className="select select-bordered rounded"
                                    value={selectedField.style?.fontFamily || FONT_OPTIONS[0]}
                                    onChange={(event) =>
                                      updateSelectedFieldStyle('fontFamily', event.target.value)
                                    }
                                  >
                                    {FONT_OPTIONS.map((fontOption) => (
                                      <option key={fontOption} value={fontOption}>
                                        {fontOption}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="form-control">
                                  <label className="label" htmlFor="field-color">
                                    <span className="label-text font-medium">Text Color</span>
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      id="field-color"
                                      type="color"
                                      value={selectedField.style?.color || '#111827'}
                                      onChange={(event) =>
                                        updateSelectedFieldStyle('color', event.target.value)
                                      }
                                      className="h-11 w-14 cursor-pointer rounded border border-base-300 bg-transparent"
                                    />
                                    <Input
                                      label=""
                                      value={selectedField.style?.color || '#111827'}
                                      onChange={(event) =>
                                        updateSelectedFieldStyle('color', event.target.value)
                                      }
                                      className="font-mono uppercase"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <Input
                                  label="Line Height"
                                  type="number"
                                  step="0.1"
                                  value={selectedField.style?.lineHeight ?? 1.2}
                                  onChange={(event) =>
                                    updateSelectedFieldStyle(
                                      'lineHeight',
                                      clamp(Number(event.target.value) || 0, 0.8, 2.5)
                                    )
                                  }
                                />
                                <Input
                                  label="Letter Spacing"
                                  type="number"
                                  step="0.1"
                                  value={selectedField.style?.letterSpacing ?? 0}
                                  onChange={(event) =>
                                    updateSelectedFieldStyle(
                                      'letterSpacing',
                                      clamp(Number(event.target.value) || 0, -2, 20)
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-widest text-base-content/35">
                                  Text Alignment
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {(['left', 'center', 'right'] as TemplateFieldTextAlign[]).map(
                                    (alignment) => (
                                      <button
                                        key={alignment}
                                        type="button"
                                        className={getTextAlignButtonClass(
                                          (selectedField.style?.textAlign || 'center') ===
                                            alignment
                                        )}
                                        onClick={() =>
                                          updateSelectedFieldStyle('textAlign', alignment)
                                        }
                                      >
                                        {alignment}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <label className="label cursor-pointer justify-start gap-3 rounded border border-base-200 bg-base-100 px-4 py-3">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={selectedField.style?.fontStyle === 'italic'}
                                    onChange={(event) =>
                                      updateSelectedFieldStyle(
                                        'fontStyle',
                                        event.target.checked ? 'italic' : 'normal'
                                      )
                                    }
                                  />
                                  <span className="label-text font-medium">Italic</span>
                                </label>

                                <label className="label cursor-pointer justify-start gap-3 rounded border border-base-200 bg-base-100 px-4 py-3">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={selectedField.style?.textTransform === 'uppercase'}
                                    onChange={(event) =>
                                      updateSelectedFieldStyle(
                                        'textTransform',
                                        event.target.checked ? 'uppercase' : 'none'
                                      )
                                    }
                                  />
                                  <span className="label-text font-medium">Uppercase</span>
                                </label>
                              </div>
                            </>
                          )}
                        </>
                      ) : null}

                      {errors.fields ? (
                        <div className="alert alert-error rounded border-none text-sm">
                          <span>{errors.fields}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.section>
              </>
            )}

            <AnimatePresence>
              {saveError ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="alert alert-error rounded border-none shadow-lg shadow-error/10"
                >
                  <span>{saveError}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <div className="xl:sticky xl:top-24 xl:h-fit">
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={SOFT_SPRING}
              className="card overflow-hidden rounded border border-base-200 bg-base-100/80 p-6 shadow-2xl backdrop-blur"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-base-content/45">
                    Live Preview
                  </p>
                </div>
                <Eye size={16} className="text-primary" />
              </div>

              {form.mode === 'background' ? (
                <>
                  <div className="mb-4 rounded border border-base-200 bg-base-200/35 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Grip size={16} className="mt-0.5 text-primary" />
                      <p className="text-sm leading-relaxed text-base-content/65">
                        Drag visible field chips on the canvas. Numeric inputs below fine-tune
                        alignment for pixel-sensitive certificate layouts.
                      </p>
                    </div>
                  </div>

                  <div
                    ref={previewRef}
                    className="relative aspect-[297/210] overflow-hidden rounded border border-base-300 bg-white shadow-inner"
                    onPointerMove={handlePreviewPointerMove}
                    onPointerUp={handlePreviewPointerUp}
                    onPointerLeave={handlePreviewPointerUp}
                  >
                    {form.backgroundImageUrl ? (
                      <img
                        src={form.backgroundImageUrl}
                        alt="Template background preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0.04))] px-6 text-center">
                        <Wand2 size={28} className="text-primary" />
                        <p className="mt-4 text-lg font-black text-base-content">
                          Upload a Canva-ready PNG
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
                          Once the background is uploaded, the field chips below become your live
                          placement layer.
                        </p>
                      </div>
                    )}

                    {form.fields
                      .filter((field) => field.visible !== false)
                      .map((field) => {
                        const previewValue = resolvePreviewValue(field);
                        const isSelected = field.name === selectedField?.name;

                        if (field.type === 'image') {
                          return (
                            <button
                              key={field.name}
                              type="button"
                              onPointerDown={(event) => handlePointerDown(event, field.name)}
                              onClick={() => setSelectedFieldName(field.name)}
                              className={`absolute overflow-hidden rounded border-2 bg-white/90 shadow-lg ${
                                isSelected ? 'border-primary' : 'border-base-300'
                              }`}
                              style={{
                                left: `${field.position.x}%`,
                                top: `${field.position.y}%`,
                                width: `${field.size?.width ?? 18}%`,
                                height: `${field.size?.height ?? 10}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <img
                                src={previewValue}
                                alt={field.label}
                                className="h-full w-full object-contain px-2 py-1"
                              />
                            </button>
                          );
                        }

                        return (
                          <button
                            key={field.name}
                            type="button"
                            onPointerDown={(event) => handlePointerDown(event, field.name)}
                            onClick={() => setSelectedFieldName(field.name)}
                            className={`absolute rounded border px-2 py-1 shadow-lg ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/15'
                                : 'border-base-300 bg-white/80'
                            }`}
                            style={{
                              left: `${field.position.x}%`,
                              top: `${field.position.y}%`,
                              width: `${field.size?.width ?? 32}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${field.style?.fontSize ?? 24}px`,
                              fontWeight: field.style?.fontWeight ?? 600,
                              fontFamily: field.style?.fontFamily || 'Arial, sans-serif',
                              color: field.style?.color || '#111827',
                              textAlign: field.style?.textAlign || 'center',
                              lineHeight: field.style?.lineHeight ?? 1.2,
                              letterSpacing: `${field.style?.letterSpacing ?? 0}px`,
                              fontStyle: field.style?.fontStyle || 'normal',
                              textTransform: field.style?.textTransform || 'none',
                              cursor: 'grab',
                            }}
                          >
                            {previewValue}
                          </button>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div
                  className="aspect-[297/210] w-full overflow-hidden rounded border border-base-300 shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center px-10 text-center text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.42em] opacity-70">
                      Preset Theme Preview
                    </p>
                    <p className="mt-4 text-3xl font-black leading-tight tracking-tight">
                      {form.name || 'Untitled Template'}
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                      {selectedPreset?.preview ||
                        'Choose one of the built-in layouts to create a fast internal template.'}
                    </p>
                    <div className="mt-8 h-px w-36 bg-white/25" />
                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.28em] text-white/75">
                      {selectedPreset?.label}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3 rounded border border-base-200 bg-base-200/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Template Snapshot
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/55">Mode</span>
                  <span className="font-black capitalize text-base-content">{form.mode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/55">Category</span>
                  <span className="font-black capitalize text-base-content">{form.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/55">Visible fields</span>
                  <span className="font-black text-base-content">{visibleFieldCount}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
