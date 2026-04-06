import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, Palette, Layout, Info, Sparkles, Wand2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { post } from '@/utils/api';
import { ROUTES, TEMPLATE_CATEGORIES } from '@/utils/constants';
import type { ApiResponse } from '@/types/api';
import type { Template } from '@/types';
import { SOFT_SPRING, TAP_PRESS, STAGGER_CONTAINER, REVEAL_ITEM } from '@/utils/motion';

const BASE_TEMPLATES = [
  { value: 'certificate-modern', label: 'Modern Professional', preview: 'Blue gradient, clean layout' },
  { value: 'certificate-classic', label: 'Classic Academic', preview: 'Elegant, formal borders' },
  { value: 'certificate-base', label: 'Event Achievement', label2: 'certificate-base', preview: 'Vibrant, bold design' },
] as const;

interface FormState {
  name: string;
  description: string;
  category: string;
  htmlContent: string;
  primaryColor: string;
  secondaryColor: string;
}

export const TemplateBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    category: 'corporate',
    htmlContent: 'certificate-modern',
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = 'Template name is required.';
    if (!form.category) newErrors.category = 'Category is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await post<Template>('/templates', form);
      const r = res as ApiResponse<Template>;
      if (r.data) {
        navigate(ROUTES.TEMPLATES);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBase = BASE_TEMPLATES.find((t) => t.value === form.htmlContent);

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
                Asset Creator
              </div>
              <h1 className="text-4xl font-black tracking-tight text-base-content md:text-5xl">
                Template Builder
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-base-content/60">
                Architect high-fidelity certificate designs with personalized layouts and corporate
                branding systems.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="h-12 rounded-sm font-black uppercase tracking-widest"
                onClick={() => navigate(ROUTES.TEMPLATES)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-12 rounded-sm px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                rightIcon={<Save size={18} />}
                onClick={handleSave}
                isLoading={isSaving}
              >
                Publish Theme
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Identity Group */}
            <motion.div variants={REVEAL_ITEM} className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2.5 text-primary">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-base-content">Identity & Metadata</h2>
              </div>
              <div className="space-y-6">
                <Input
                  label="Display Name"
                  placeholder="e.g. Executive Training Certificate"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  error={errors.name}
                />
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-black uppercase tracking-widest text-base-content/40 text-[10px]">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-28 resize-none rounded-none focus:border-primary/50"
                    placeholder="Briefly explain the purpose of this template..."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-black uppercase tracking-widest text-base-content/40 text-[10px]">Classification</span>
                  </label>
                  <select
                    className="select select-bordered rounded-none focus:border-primary/50"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                  >
                    {TEMPLATE_CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Structure Group */}
            <motion.div variants={REVEAL_ITEM} className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2.5 text-primary">
                  <Layout size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-base-content">Base Architecture</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {BASE_TEMPLATES.map((t) => {
                  const isActive = form.htmlContent === t.value;
                  return (
                    <motion.button
                      key={t.value}
                      onClick={() => set('htmlContent', t.value)}
                      className={`group card relative overflow-hidden border p-5 text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-base-200 bg-base-100 hover:border-primary/40'
                      }`}
                      whileHover={{ y: -4 }}
                      whileTap={TAP_PRESS}
                    >
                      <p className="text-sm font-black text-base-content">{t.label}</p>
                      <p className="mt-2 text-[10px] font-bold leading-relaxed text-base-content/40">{t.preview}</p>
                      {isActive && (
                        <div className="absolute -right-6 -top-6 rounded-full bg-primary/10 p-8">
                          <Palette size={16} className="text-primary" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Brand Colors */}
            <motion.div variants={REVEAL_ITEM} className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2.5 text-primary">
                  <Palette size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-base-content">Brand Visual System</h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                {[
                  { label: 'Primary Brand', field: 'primaryColor' as const },
                  { label: 'Accent Highlight', field: 'secondaryColor' as const },
                ].map((item) => (
                  <div key={item.field} className="form-control">
                    <label className="label">
                      <span className="label-text font-black uppercase tracking-widest text-base-content/40 text-[10px]">{item.label}</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded ring-1 ring-base-200">
                        <input
                          type="color"
                          value={form[item.field]}
                          onChange={(e) => set(item.field, e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer border-none p-0"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={form[item.field]}
                          onChange={(e) => set(item.field, e.target.value)}
                          className="input input-bordered w-full rounded-none font-mono text-sm tracking-widest uppercase focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="alert alert-error rounded-none border-none font-bold"
                >
                  <span>{saveError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Real-time Rendering Sandbox */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={SOFT_SPRING}
              className="card relative overflow-hidden rounded border border-base-200 bg-base-100/60 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-base-content">Canvas Preview</p>
                </div>
                <Eye size={16} className="text-primary" />
              </div>

              <div
                className="aspect-[4/3] w-full overflow-hidden rounded shadow-xl ring-1 ring-base-300"
                style={{
                  background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white">
                  <div className="mb-4 h-1 w-12 rounded-full bg-white/30" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Verification Record</p>
                  <p className="mt-3 text-2xl font-black tracking-tight leading-tight">
                    {form.name || 'Untitled Document'}
                  </p>
                  <p className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-40">Recipient Identity Hub</p>
                  <div className="mt-4 h-0.5 w-full max-w-[120px] bg-white/20" />
                  <p className="mt-4 text-[10px] font-bold italic opacity-60">
                    {selectedBase?.label} · {form.category}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  { label: 'Architecture', value: selectedBase?.label },
                  { label: 'Category', value: form.category },
                  { label: 'Primary Hex', value: form.primaryColor, color: form.primaryColor },
                  { label: 'Accent Hex', value: form.secondaryColor, color: form.secondaryColor },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between border-b border-base-200/50 pb-3 last:border-0 last:pb-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{spec.label}</p>
                    <div className="flex items-center gap-2">
                      {spec.color && (
                        <div className="h-3 w-3 rounded-full ring-1 ring-base-200" style={{ backgroundColor: spec.color }} />
                      )}
                      <p className="text-xs font-black uppercase tracking-tight text-base-content">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-base-content/20"
            >
              <Wand2 size={12} />
              <span>Streaming Live to Workspace Hub</span>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
