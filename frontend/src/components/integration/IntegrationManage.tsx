import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  GraduationCap,
  Code,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Activity,
  Clock,
  Check,
} from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import { Button } from '@/components/common/Button';
import type { Integration, IntegrationProvider } from '@/types/integration';
import {
  REVEAL_ITEM,
  STAGGER_CONTAINER,
  QUICK_SPRING,
  TAP_PRESS,
} from '@/utils/motion';

interface IntegrationManageProps {
  integrations: Integration[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (integration: Integration) => void;
  onDelete: (integrationId: string) => Promise<void>;
  onToggleStatus: (integration: Integration) => Promise<void>;
  onCopyWebhook?: (webhookUrl: string) => void;
  onCreateNew?: () => void;
}

const providerConfig = {
  google_sheets: {
    icon: FileSpreadsheet,
    label: 'Google Sheets',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  canvas: {
    icon: GraduationCap,
    label: 'Canvas LMS',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  custom: {
    icon: Code,
    label: 'Custom Webhook',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

export const IntegrationManage: React.FC<IntegrationManageProps> = ({
  integrations,
  isLoading: _isLoading,
  error: _error,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyWebhook: _onCopyWebhook,
  onCreateNew,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (integration: Integration) => {
    if (
      !window.confirm(`Delete "${integration.name}"? This cannot be undone.`)
    ) {
      return;
    }
    setDeletingId(integration._id);
    try {
      await onDelete(integration._id);
    } finally {
      setDeletingId(null);
      setMenuOpenId(null);
    }
  };

  const handleToggle = async (integration: Integration) => {
    setTogglingId(integration._id);
    try {
      await onToggleStatus(integration);
    } finally {
      setTogglingId(null);
      setMenuOpenId(null);
    }
  };

  const copyWebhookUrl = (integration: Integration) => {
    navigator.clipboard.writeText(integration.webhookUrl);
    setMenuOpenId(null);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (integrations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={QUICK_SPRING}
        className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/30 p-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
          <Activity size={28} className="text-base-content/40" />
        </div>
        <h3 className="text-lg font-bold text-base-content">
          No integrations yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-base-content/60">
          Create your first integration to start automating certificate
          generation.
        </p>
        <motion.button
          onClick={() => onCreateNew?.()}
          className="btn btn-primary mt-6 rounded px-6 font-bold"
          whileHover={{ y: -2 }}
          whileTap={TAP_PRESS}
          transition={QUICK_SPRING}
        >
          Create Integration
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-base-content">
            Your Integrations
          </h2>
          <p className="text-sm text-base-content/60">
            {integrations.length} integration
            {integrations.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onCreateNew?.()}>
          Add New
        </Button>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const config =
            providerConfig[integration.provider as IntegrationProvider];
          const isActive = integration.status === 'active';
          const isDeleting = deletingId === integration._id;
          const isToggling = togglingId === integration._id;

          return (
            <motion.div
              key={integration._id}
              variants={REVEAL_ITEM}
              className="group relative rounded-lg border border-base-200 bg-base-100 p-4 transition-colors hover:border-base-300"
              whileHover={{ y: -2 }}
              transition={QUICK_SPRING}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${config.bgColor}`}>
                  <config.icon size={22} className={config.color} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base-content">
                          {integration.name}
                        </h3>
                        <span
                          className={`badge badge-sm ${
                            isActive ? 'badge-success' : 'badge-ghost'
                          }`}
                        >
                          {isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-base-content/60">
                        {config.label} • {integration.mode} mode
                      </p>
                    </div>

                    <div className="relative">
                      <motion.button
                        onClick={() =>
                          setMenuOpenId(
                            menuOpenId === integration._id
                              ? null
                              : integration._id
                          )
                        }
                        className="btn btn-ghost btn-sm btn-circle"
                        whileTap={TAP_PRESS}
                      >
                        <MoreVertical size={16} />
                      </motion.button>

                      <AnimatePresence>
                        {menuOpenId === integration._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-base-200 bg-base-100 p-1 shadow-lg"
                          >
                            <button
                              onClick={() => {
                                onEdit(integration);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-base-200"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggle(integration)}
                              disabled={isToggling}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-base-200 disabled:opacity-50"
                            >
                              {isActive ? (
                                <Pause size={14} />
                              ) : (
                                <Play size={14} />
                              )}
                              {isToggling
                                ? 'Updating...'
                                : isActive
                                  ? 'Pause'
                                  : 'Activate'}
                            </button>
                            <button
                              onClick={() => copyWebhookUrl(integration)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-base-200"
                            >
                              <Copy size={14} />
                              Copy Webhook URL
                            </button>
                            <div className="my-1 h-px bg-base-200" />
                            <button
                              onClick={() => handleDelete(integration)}
                              disabled={isDeleting}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-error hover:bg-error/10 disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-base-content/50">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Created {formatDate(integration.createdAt)}
                    </div>
                    {integration.stats?.lastTriggeredAt && (
                      <div className="flex items-center gap-1.5">
                        <Activity size={12} />
                        Last run {formatDate(integration.stats.lastTriggeredAt)}
                      </div>
                    )}
                    {integration.stats?.totalRuns !== undefined &&
                      integration.stats.totalRuns > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Check size={12} />
                          {integration.stats.totalRuns} runs
                        </div>
                      )}
                  </div>

                  {integration.provider === 'google_sheets' &&
                    integration.settings?.googleSheets?.spreadsheetId && (
                      <div className="mt-3 rounded-md bg-base-200/50 px-3 py-2">
                        <p className="text-xs text-base-content/50">
                          Spreadsheet ID
                        </p>
                        <p className="font-mono text-sm text-base-content">
                          {integration.settings.googleSheets.spreadsheetId.slice(
                            0,
                            30
                          )}
                          {integration.settings.googleSheets.spreadsheetId
                            .length > 30 && '...'}
                        </p>
                      </div>
                    )}

                  {integration.provider === 'canvas' &&
                    integration.settings?.canvas?.baseUrl && (
                      <div className="mt-3 rounded-md bg-base-200/50 px-3 py-2">
                        <p className="text-xs text-base-content/50">
                          Canvas URL
                        </p>
                        <p className="text-sm text-base-content">
                          {integration.settings.canvas.baseUrl}
                        </p>
                      </div>
                    )}

                  {integration.provider === 'custom' && (
                    <div className="mt-3 rounded-md bg-base-200/50 px-3 py-2">
                      <p className="text-xs text-base-content/50">
                        Webhook URL
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 truncate font-mono text-sm text-base-content">
                          {integration.webhookUrl}
                        </p>
                        <Tooltip content="Open webhook URL" position="top">
                          <a
                            href={integration.webhookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open webhook URL"
                            className="text-base-content/50 hover:text-base-content"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {menuOpenId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </motion.div>
  );
};
