import { Key, Webhook, Plus, Copy, Check, Trash2, Globe, ShieldAlert, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { ALL_WEBHOOK_EVENTS } from '@/utils/webhookApi';
import type { DeveloperTabProps } from './types';

export const DeveloperTab: React.FC<DeveloperTabProps> = ({
  apiKeys,
  newKeyName,
  setNewKeyName,
  handleCreateKey,
  handleRevokeKey,
  createdKey,
  setCreatedKey,
  handleCopyKey,
  keyCopied,
  keyLoading,
  keyError,
  webhooks,
  newWebhookUrl,
  setNewWebhookUrl,
  newWebhookEvents,
  toggleEvent,
  handleCreateWebhook,
  handleDeleteWebhook,
  webhookLoading,
  webhookError,
  createdSecret,
  setCreatedSecret,
  handleCopySecret,
  secretCopied,
}) => {
  return (
    <div className="space-y-8">
      {/* API Keys Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-base-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 rounded p-2 text-warning">
              <Key size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-base-content uppercase tracking-widest text-[16px] mb-1">API Connections</h2>
              <p className="text-sm text-base-content/55 font-medium leading-relaxed">Secure credentials for external application integration.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-base-200/40 px-4 py-2 rounded border border-base-200">
            <Terminal size={14} className="text-base-content/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30 italic">v1.2 Protocol</span>
          </div>
        </div>

        {createdKey && (
          <div className="alert border-warning/30 bg-warning/5 flex-col items-start gap-4 p-6 rounded mb-8 relative border-2 border-dashed">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <p className="meta-label !text-warning">Secure Token Generated — Store it now</p>
            </div>
            <div className="flex items-center gap-3 w-full bg-base-100 p-4 rounded border border-base-200 shadow-inner">
              <code className="font-mono text-sm leading-none text-base-content flex-1 break-all tracking-tight font-black">{createdKey}</code>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-sm btn-ghost h-10 w-10 flex items-center justify-center p-0"
                onClick={handleCopyKey}
                aria-label="Copy API key"
              >
                {keyCopied ? <Check size={18} className="text-success" /> : <Copy size={18} className="text-base-content/40" />}
              </motion.button>
            </div>
            <p className="text-xs font-bold text-base-content/40 italic flex items-center gap-1.5"><ShieldAlert size={12} /> This credential is encrypted and cannot be retrieved after dismissal.</p>
            <button className="btn btn-xs btn-ghost text-[10px] font-black absolute top-4 right-4" onClick={() => setCreatedKey(null)}>Dismiss</button>
          </div>
        )}

        <div className="space-y-3 mb-8">
          <p className="meta-label italic px-1 mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-base-content/20" /> Active Credentials
          </p>
          {apiKeys.length === 0 && !createdKey ? (
            <div className="p-10 border-2 border-dashed border-base-200 rounded text-center">
              <p className="text-sm font-bold text-base-content/40 italic">No external integrations detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((k, index) => (
                <motion.div
                  key={k._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="flex items-center justify-between bg-base-200/30 rounded px-5 py-4 border border-base-200 hover:bg-base-200/50 transition-all hover:border-base-300"
                >
                  <div className="min-w-0">
                    <p className="font-black text-sm text-base-content tracking-tight">{k.name}</p>
                    <p className="font-mono text-[11px] text-base-content/40 mt-1 uppercase tracking-widest">{k.keyPreview}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm text-error h-10 w-10 min-h-[40px] p-0 hover:bg-error/10 hover:border-error/20 rounded"
                    onClick={() => handleRevokeKey(k._id)}
                    aria-label={`Revoke key ${k.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-base-200/60 items-end">
          <div className="form-control flex-1 w-full">
            <label className="label h-8 p-0 mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-base-content/40">Label your connection</span>
            </label>
            <input
              type="text"
              className="input input-bordered h-12 w-full rounded bg-base-200/20 font-bold text-sm tracking-tight focus:bg-base-100"
              placeholder="e.g. Workflow Primary..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateKey(); }}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleCreateKey}
            disabled={keyLoading || !newKeyName.trim()}
            className="h-12 px-8 font-black uppercase tracking-widest text-xs rounded shadow-lg shadow-primary/10"
          >
            {keyLoading ? <span className="loading loading-spinner loading-xs" /> : <Plus size={16} />}
            Spawn Key
          </Button>
        </div>
        {keyError && <p className="text-error text-[11px] font-black uppercase tracking-widest mt-4 px-2">{keyError}</p>}
      </motion.div>

      {/* Webhooks Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card bg-base-100 border border-base-200 p-6 shadow-sm overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-base-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 rounded p-2 text-secondary">
              <Webhook size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-base-content uppercase tracking-widest text-[16px] mb-1">Outbound Webhooks</h2>
              <p className="text-sm text-base-content/55 font-medium leading-relaxed">Real-time callbacks to your centralized processing apps.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-base-200/40 px-4 py-2 rounded border border-base-200">
            <Globe size={14} className="text-base-content/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30 italic">Cloud Sync enabled</span>
          </div>
        </div>

        {createdSecret && (
          <div className="alert border-secondary/30 bg-secondary/5 flex-col items-start gap-4 p-6 rounded mb-8 relative border-2 border-dashed">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary">Signature Secret Generated — Critical Item</p>
            </div>
            <div className="flex items-center gap-3 w-full bg-base-100 p-4 rounded border border-base-200 shadow-inner">
              <code className="font-mono text-sm leading-none text-base-content flex-1 break-all tracking-tight font-black">{createdSecret}</code>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-sm btn-ghost h-10 w-10 flex items-center justify-center p-0"
                onClick={handleCopySecret}
              >
                {secretCopied ? <Check size={18} className="text-success" /> : <Copy size={18} className="text-base-content/40" />}
              </motion.button>
            </div>
            <p className="text-xs font-bold text-base-content/40 italic flex items-center gap-1.5"><ShieldAlert size={12} /> This secret validates incoming Certify requests. It cannot be recovered later.</p>
            <button className="btn btn-xs btn-ghost text-[10px] font-black absolute top-4 right-4" onClick={() => setCreatedSecret(null)}>Dismiss</button>
          </div>
        )}

        <div className="space-y-4 mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/30 italic px-1 mb-2 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-base-content/20" /> Active Endpoints
          </p>
          {webhooks.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-base-200 rounded text-center">
              <p className="text-sm font-bold text-base-content/40 italic">No outbound delivery routes configured.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh, idx) => (
                <motion.div
                  key={wh._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-base-100 rounded border border-base-200 hover:border-secondary/20 transition-all hover:shadow-sm"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-secondary/5 p-1.5 rounded border border-secondary/10">
                        <Globe size={14} className="text-secondary" />
                      </div>
                      <p className="font-mono text-[13px] font-black text-base-content/80 truncate tracking-tight">{wh.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {wh.events.map((ev) => (
                        <span key={ev} className="badge badge-xs h-5 px-3 py-0 border-none bg-base-200 text-base-content/50 font-black uppercase tracking-widest text-[9px]">{ev.replace('certificate.', '')}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm text-error h-10 w-10 min-h-[40px] p-0 hover:bg-error/5 border-transparent hover:border-error/10 rounded"
                    onClick={() => handleDeleteWebhook(wh._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 pt-8 border-t border-base-200/60">
          <div className="form-control w-full">
            <label className="label h-8 p-0 mb-3 ml-1">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">New Target Protocol (URL)</span>
            </label>
            <input
              type="url"
              className="input input-bordered h-12 w-full rounded bg-base-200/20 font-bold text-sm tracking-tight focus:bg-base-100"
              placeholder="https://your-backend.io/hooks/certify"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
            />
          </div>
          
          <div className="form-control mb-2">
            <label className="label h-8 p-0 mb-3 ml-1">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Trigger Subscription</span>
            </label>
            <div className="flex flex-wrap gap-3 bg-base-200/20 p-5 rounded border border-base-200/50">
              {ALL_WEBHOOK_EVENTS.map((ev) => (
                <label
                  key={ev}
                  className={`flex items-center gap-3 rounded px-4 py-3 min-h-[44px] cursor-pointer border transition-all ${
                    newWebhookEvents.includes(ev) 
                      ? 'bg-secondary/10 border-secondary/30 text-secondary' 
                      : 'bg-base-100 border-base-200 text-base-content/50 hover:bg-base-200/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary checkbox-sm"
                    checked={newWebhookEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  <span className="font-black text-[10px] uppercase tracking-widest">{ev.replace('certificate.', '')}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              onClick={handleCreateWebhook}
              disabled={webhookLoading || !newWebhookUrl.trim() || newWebhookEvents.length === 0}
              className="h-12 px-10 font-black uppercase tracking-widest text-xs rounded shadow-lg shadow-secondary/10"
            >
              {webhookLoading ? <span className="loading loading-spinner loading-xs" /> : <Webhook size={16} />}
              Initialize Webhook
            </Button>
          </div>
        </div>
        {webhookError && <p className="text-error text-[11px] font-black uppercase tracking-widest mt-4 px-2">{webhookError}</p>}
      </motion.div>
    </div>
  );
};
