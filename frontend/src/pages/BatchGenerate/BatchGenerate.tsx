import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Play,
  FileText,
  Award,
  CheckCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BatchUpload } from '@/components/batch/BatchUpload';
import { BatchProgress } from '@/components/batch/BatchProgress';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { useTemplates } from '@/hooks/useTemplates';
import { useBatchImport } from '@/hooks/useBatchImport';
import type { Template } from '@/types';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

type Step = 'upload' | 'select-template' | 'preview' | 'generating' | 'done';

export const BatchGenerate: React.FC = () => {
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { preview, job, error, isLoading, parseLocalFile, startGeneration, reset } =
    useBatchImport();

  const [step, setStep] = useState<Step>('upload');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleFileParsed = (rows: Record<string, string>[]) => {
    if (rows.length > 0) {
      setStep('select-template');
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handlePreview = () => {
    if (selectedTemplate) {
      setStep('preview');
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setStep('generating');
    await startGeneration(selectedTemplate._id);
  };

  const handleReset = () => {
    reset();
    setSelectedTemplate(null);
    setStep('upload');
  };

  const STEPS: Array<{ key: Step; label: string }> = [
    { key: 'upload', label: 'Upload CSV' },
    { key: 'select-template', label: 'Select Template' },
    { key: 'preview', label: 'Preview' },
    { key: 'generating', label: 'Generating' },
    { key: 'done', label: 'Done' },
  ];

  const currentStepIndex = STEPS.findIndex((item) => item.key === step);

  React.useEffect(() => {
    if (!job) return;

    if (job.status === 'completed' || job.status === 'failed') {
      setStep('done');
    }
  }, [job]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-6 w-1.5 rounded-full bg-primary" />
            <h1 className="text-3xl font-black tracking-tighter text-base-content">
              Batch Generation
            </h1>
          </div>
          <p className="font-medium text-base-content/50">
            Issue hundreds of professional certificates instantly via CSV or Excel automation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-base-200 bg-base-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-base-content/45 shadow-sm">
              Current Stage: {STEPS[currentStepIndex]?.label ?? 'Upload CSV'}
            </div>
            <div className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary/80 shadow-sm">
              Template: {selectedTemplate?.name ?? 'Not selected'}
            </div>
            <div className="rounded-full border border-accent/15 bg-accent/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent/80 shadow-sm">
              Rows Queued: {preview?.total ?? 0}
            </div>
          </div>
        </motion.div>

        <LayoutGroup id="batch-stepper">
          <div className="mb-12 -mx-2 overflow-x-auto px-2">
            <div className="flex min-w-max items-center gap-2 rounded border border-base-200/50 bg-base-200/30 p-2">
              {STEPS.map((item, index) => {
                const isCurrent = index === currentStepIndex;
                const isDone = index < currentStepIndex;

                return (
                  <React.Fragment key={item.key}>
                    <motion.div
                      className="relative flex min-w-[150px] items-center justify-center gap-3 overflow-hidden rounded px-4 py-3"
                      animate={{
                        scale: isCurrent ? 1 : 0.985,
                        opacity: isCurrent ? 1 : 0.58,
                      }}
                      transition={SOFT_SPRING}
                    >
                      {isCurrent && (
                        <motion.div
                          layoutId="batch-active-step"
                          className="absolute inset-0 rounded border border-base-200 bg-base-100 shadow-sm"
                          transition={SOFT_SPRING}
                        />
                      )}
                      <motion.div
                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded border text-[10px] font-black ${
                          isDone
                            ? 'border-success bg-success text-success-content'
                            : isCurrent
                              ? 'border-primary bg-primary text-primary-content'
                              : 'border-base-300 bg-base-300 text-base-content/40'
                        }`}
                        animate={{ scale: isCurrent ? 1.06 : 1 }}
                        transition={QUICK_SPRING}
                      >
                        {isDone ? <CheckCircle size={12} /> : index + 1}
                      </motion.div>
                      <span
                        className={`relative z-10 text-xs font-black uppercase tracking-widest ${
                          isCurrent ? 'text-base-content' : 'text-base-content/40'
                        }`}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                    {index < STEPS.length - 1 && <div className="mx-1 h-6 w-px bg-base-300" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded bg-primary/10 p-2 text-primary">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-base-content">
                    Recipients Source
                  </h2>
                </div>
                <BatchUpload
                  onParsed={(rows, file) => {
                    parseLocalFile(file);
                    handleFileParsed(rows);
                  }}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </motion.div>
          )}

          {step === 'select-template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="card rounded border border-base-200 bg-base-100 p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded bg-primary/10 p-2 text-primary">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-base-content">
                    Select Design Theme
                  </h2>
                </div>

                {templatesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loading size="lg" text="Loading templates..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const isSelected = selectedTemplate?._id === template._id;

                      return (
                        <motion.button
                          key={template._id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`group card overflow-hidden rounded border p-0 text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                              : 'border-base-200 bg-base-100 hover:border-primary/40'
                          }`}
                          whileHover={{ y: -6, scale: 1.01, transition: SOFT_SPRING }}
                          whileTap={TAP_PRESS}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-base-200">
                            {template.thumbnail ? (
                              <motion.img
                                src={template.thumbnail}
                                alt={template.name}
                                className="h-full w-full object-cover"
                                whileHover={{ scale: 1.06, transition: SOFT_SPRING }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Award size={48} className="text-base-content/10" />
                              </div>
                            )}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={QUICK_SPRING}
                                className="absolute right-3 top-3 rounded bg-primary p-1 text-primary-content shadow-lg"
                              >
                                <CheckCircle size={14} />
                              </motion.div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="mb-1 font-black tracking-tight text-base-content">
                              {template.name}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                              {template.category}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded border border-base-200/50 bg-base-200/30 p-4">
                <Button
                  variant="ghost"
                  className="rounded font-bold"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => setStep('upload')}
                >
                  Change Data Source
                </Button>
                <Button
                  variant="primary"
                  className="rounded px-10 font-black shadow-lg shadow-primary/10"
                  rightIcon={<ArrowRight size={18} />}
                  onClick={handlePreview}
                  disabled={!selectedTemplate}
                >
                  PREVIEW GENERATION
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'preview' && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="card overflow-hidden rounded border border-base-200 bg-base-100 shadow-sm">
                <div className="flex items-center justify-between border-b border-base-200 bg-base-200/10 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2 text-primary">
                      <Users size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-base-content">
                        Review Queue
                      </h2>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-base-content/30">
                        Template: <span className="text-primary">{selectedTemplate?.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="rounded border border-base-300/50 bg-base-200 px-4 py-2">
                    <span className="text-lg font-black tracking-tight text-base-content">
                      {preview.total}
                    </span>
                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-base-content/30">
                      Total Rows
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-md w-full">
                    <thead>
                      <tr className="border-b border-base-200 bg-base-200/5 text-base-content/30">
                        {Object.keys(preview.preview[0] ?? {}).map((column) => (
                          <th
                            key={column}
                            className="py-4 text-[10px] font-black uppercase tracking-widest first:pl-8 last:pr-8"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-200">
                      {preview.preview.map((row, rowIndex) => (
                        <motion.tr
                          key={rowIndex}
                          whileHover={{ backgroundColor: 'rgba(226,232,240,0.35)' }}
                          transition={QUICK_SPRING}
                        >
                          {Object.values(row).map((value, valueIndex) => (
                            <td
                              key={valueIndex}
                              className="max-w-[200px] truncate py-4 text-sm font-medium text-base-content/70 first:pl-8 last:pr-8"
                            >
                              {value}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {preview.total > 5 && (
                  <div className="border-t border-base-200 bg-base-200/20 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-base-content/20">
                      + {preview.total - 5} additional recipients in queue
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded border border-base-200/50 bg-base-200/30 p-4">
                <Button
                  variant="ghost"
                  className="rounded font-bold"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => setStep('select-template')}
                >
                  Change Template
                </Button>
                <Button
                  variant="primary"
                  className="h-14 rounded px-12 text-lg font-black shadow-xl shadow-primary/20"
                  leftIcon={<Play size={20} />}
                  onClick={handleGenerate}
                  isLoading={isLoading}
                >
                  START BATCH GENERATION
                </Button>
              </div>
            </motion.div>
          )}

          {(step === 'generating' || step === 'done') && job && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="card rounded border border-base-200 bg-base-100 p-8 shadow-lg shadow-base-300/20">
                <BatchProgress job={job} />
              </div>

              {step === 'done' && (
                <div className="flex justify-center pb-12">
                  <Button
                    variant="outline"
                    className="h-auto rounded-full border-2 px-12 py-6 text-lg font-black shadow-xl shadow-base-200 hover:border-primary hover:bg-primary hover:text-primary-content"
                    onClick={handleReset}
                  >
                    Generate Another Batch
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
