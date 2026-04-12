import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useTemplates } from '@/hooks/useTemplates';
import { deleteTemplate } from '@/utils/templateApi';
import { ROUTES, TEMPLATE_CATEGORIES } from '@/utils/constants';
import { SOFT_SPRING, TAP_PRESS } from '@/utils/motion';
import type { Template } from '@/types';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { templates, isLoading, error, refetch } = useTemplates();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  const handleCreateNew = () => {
    navigate(ROUTES.TEMPLATE_BUILDER);
  };

  const handleEdit = (template: Template) => {
    navigate(`${ROUTES.TEMPLATE_BUILDER}?edit=${template._id}`);
  };

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteTemplate(templateToDelete._id);
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
      refetch?.();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete template'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isSystemTemplate = (template: Template) => {
    return template.creatorId === '000000000000000000000001';
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
                Template Management
              </div>
              <h1 className="text-4xl font-black tracking-tight text-base-content md:text-5xl">
                Certificate Templates
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-base-content/60">
                Manage your certificate templates. Create new designs, edit
                existing ones, or remove templates you no longer need.
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
                  Template Snapshot
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-3xl font-black tracking-tight text-base-content">
                    {templates.length}
                  </p>
                  <p className="pb-1 text-xs font-bold uppercase tracking-widest text-base-content/45">
                    templates
                  </p>
                </div>
              </motion.div>

              <Button
                variant="primary"
                className="h-14 rounded px-10 text-[13px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                leftIcon={<Plus size={18} />}
                onClick={handleCreateNew}
              >
                Create New Template
              </Button>
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
            <div className="flex flex-wrap gap-2 rounded border border-base-200 bg-base-100/80 p-2 shadow-sm backdrop-blur">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.value;

                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    whileTap={TAP_PRESS}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`relative min-h-[44px] overflow-hidden rounded px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-content'
                        : 'text-base-content/45 hover:text-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="templates-page-pill"
                        className="absolute inset-0 rounded bg-primary shadow-lg shadow-primary/20"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                    {!isActive && (
                      <motion.span
                        className="absolute inset-0 rounded bg-transparent"
                        whileHover={{
                          backgroundColor: 'rgba(59,130,246,0.12)',
                        }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="flex items-center gap-2 rounded border border-base-200 bg-base-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-base-content/35 shadow-sm">
            <Filter size={14} />
            <span>Showing {filteredTemplates.length} templates</span>
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
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="card animate-pulse rounded border border-base-200 bg-base-100 p-4"
                >
                  <div className="aspect-[4/3] rounded bg-base-200" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-base-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-base-200" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="card rounded border border-base-200 bg-base-100 p-12 text-center">
              <p className="text-lg font-bold text-base-content/60">
                No templates found
              </p>
              <p className="mt-2 text-sm text-base-content/40">
                {activeCategory === 'all'
                  ? 'Create your first template to get started.'
                  : `No templates in the "${activeCategory}" category.`}
              </p>
              <Button
                variant="primary"
                className="mx-auto mt-6 rounded"
                leftIcon={<Plus size={16} />}
                onClick={handleCreateNew}
              >
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SOFT_SPRING}
                  className="group card rounded border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t bg-base-200">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base-content/20">
                        <Sparkles size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-base-content/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={TAP_PRESS}
                        onClick={() => handleEdit(template)}
                        className="btn btn-sm flex-1 rounded bg-base-100/90 font-bold text-base-content backdrop-blur hover:bg-base-100"
                      >
                        <Edit2 size={14} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={TAP_PRESS}
                        onClick={() => handleDeleteClick(template)}
                        disabled={isSystemTemplate(template)}
                        className={`btn btn-sm rounded font-bold backdrop-blur ${
                          isSystemTemplate(template)
                            ? 'btn-ghost cursor-not-allowed opacity-50'
                            : 'bg-error/90 text-error-content hover:bg-error'
                        }`}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                    {isSystemTemplate(template) && (
                      <div className="absolute right-2 top-2 rounded bg-primary/90 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-primary-content">
                        System
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-black tracking-tight text-base-content">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                      {template.category} • {template.mode || 'preset'}
                    </p>
                    {template.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-base-content/60">
                        {template.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Template"
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
                <AlertTriangle size={32} />
              </div>
            </div>
            <p className="mt-4 text-center text-lg font-bold text-base-content">
              Delete "{templateToDelete?.name}"?
            </p>
            <p className="mt-2 text-center text-sm text-base-content/60">
              This action cannot be undone. The template will be permanently
              removed.
            </p>

            {deleteError && (
              <div className="alert alert-error mt-4 rounded text-sm font-bold">
                {deleteError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                className="h-12 rounded font-bold"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-12 rounded bg-error font-bold text-error-content hover:bg-error"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
