import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TemplateGallery } from '@/components/template/TemplateGallery';
import { Button } from '@/components/common/Button';
import { useTemplates } from '@/hooks/useTemplates';
import { ROUTES, TEMPLATE_CATEGORIES } from '@/utils/constants';
import type { Template } from '@/types';
import { QUICK_SPRING, SOFT_SPRING, TAP_PRESS } from '@/utils/motion';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { templates, isLoading, error } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleProceed = () => {
    if (!selectedTemplate) return;
    navigate(ROUTES.CREATE_CERTIFICATE, { state: { templateId: selectedTemplate._id } });
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
                Design Library
              </div>
              <h1 className="text-4xl font-black tracking-tight text-base-content md:text-5xl">
                Certificate Templates
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-base-content/60">
                Choose a professional theme to get started. Every layout is fully customizable to
                match your brand identity and event tone.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SOFT_SPRING, delay: 0.08 }}
                className="rounded border border-base-200 bg-base-100/90 px-4 py-3 shadow-sm backdrop-blur"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Library Snapshot
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-3xl font-black tracking-tight text-base-content">
                    {templates.length}
                  </p>
                  <p className="pb-1 text-xs font-bold uppercase tracking-widest text-base-content/45">
                    templates ready
                  </p>
                </div>
              </motion.div>

              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={QUICK_SPRING}
                >
                  <Button
                    variant="primary"
                    className="h-14 rounded-sm px-10 text-[13px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    rightIcon={<ArrowRight size={18} />}
                    onClick={handleProceed}
                  >
                    Use Selected
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SOFT_SPRING, delay: 0.1 }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <LayoutGroup id="templates-page-filters">
            <div className="flex flex-wrap gap-2 rounded-3xl border border-base-200 bg-base-100/80 p-2 shadow-sm backdrop-blur">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.value;

                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    whileTap={TAP_PRESS}
                    onClick={() => {
                      setActiveCategory(cat.value);
                      setSelectedTemplate(null);
                    }}
                    className={`relative min-h-[44px] overflow-hidden rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest ${
                      isActive ? 'text-primary-content' : 'text-base-content/45'
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="templates-page-pill"
                        className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/20"
                        transition={QUICK_SPRING}
                      />
                    ) : (
                      <motion.span
                        className="absolute inset-0 rounded-full"
                        whileHover={{ backgroundColor: 'rgba(226,232,240,0.85)' }}
                        transition={QUICK_SPRING}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-base-200 bg-base-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-base-content/35 shadow-sm">
              <Filter size={14} />
              <span>Showing {filteredTemplates.length} layouts</span>
            </div>
            <div className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary/80 shadow-sm">
              {selectedTemplate ? selectedTemplate.name : 'Choose a theme to continue'}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert alert-error mb-8 rounded border-none font-bold"
          >
            <span>{error}</span>
          </motion.div>
        )}

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SOFT_SPRING, delay: 0.2 }}
        >
          <TemplateGallery
            templates={filteredTemplates}
            selectedId={selectedTemplate?._id}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </motion.div>

        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={SOFT_SPRING}
              className="fixed bottom-8 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4 md:max-w-xl"
            >
              <div className="card flex flex-col items-center gap-6 border border-base-200 bg-base-100/90 p-5 shadow-[0_45px_90px_-25px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:flex-row sm:p-6">
                <div className="flex flex-1 items-center gap-4">
                  <div className="h-14 w-20 overflow-hidden rounded border border-base-200 bg-base-200/50">
                    {selectedTemplate.thumbnail ? (
                      <img
                        src={selectedTemplate.thumbnail}
                        alt={selectedTemplate.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/20">
                        <ArrowRight size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tight text-base-content">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                      Primary Theme Base
                    </p>
                  </div>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={TAP_PRESS}
                    onClick={handleProceed}
                    className="btn btn-primary h-12 flex-1 rounded-sm px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20 sm:flex-none"
                  >
                    Use Theme
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
