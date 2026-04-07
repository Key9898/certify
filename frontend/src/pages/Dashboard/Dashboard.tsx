import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  FileText,
  TrendingUp,
  Webhook,
  Zap,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCertificates } from '@/hooks/useCertificates';
import { useTemplates } from '@/hooks/useTemplates';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Loading } from '@/components/common/Loading';
import { useDemo } from '@/context/DemoContext';
import { useAppUser } from '@/context/AuthContext';
import { get } from '@/utils/api';
import { ROUTES } from '@/utils/constants';
import { formatDateShort, getAuthProfileDisplayName } from '@/utils/formatters';
import {
  OverviewChart,
  type OverviewChartPoint,
} from '@/components/dashboard/Analytics/OverviewChart';
import {
  UsageChart,
  type UsageChartPoint,
} from '@/components/dashboard/Analytics/UsageChart';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import {
  QUICK_SPRING,
  REVEAL_ITEM,
  SOFT_SPRING,
  STAGGER_CONTAINER,
  TAP_PRESS,
} from '@/utils/motion';

interface AnalyticsResponse {
  certificates: {
    total: number;
    thisMonth: number;
    byMonth: Array<{ year: number; month: number; count: number }>;
  };
  batch: {
    total: number;
    completed: number;
    successRate: number;
  };
  templates: {
    customCount: number;
    topUsed: Array<{ templateId: string; templateName: string; count: number }>;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth0();
  const { appUser } = useAppUser();
  const displayName = getAuthProfileDisplayName(user);
  const { isDemoMode } = useDemo();
  const { certificates, isLoading: certsLoading } = useCertificates({ page: 1 });
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { integrations } = useIntegrations();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const isLoading = certsLoading || templatesLoading;
  const recentCertificates = certificates.slice(0, 5);
  const workspaceName =
    appUser?.organization?.whiteLabel.brandName || appUser?.organization?.name || 'Certify';

  useEffect(() => {
    const loadAnalytics = async () => {
      if (certsLoading || templatesLoading) return;

      if (isDemoMode) {
        const byMonthMap = new Map<string, number>();
        certificates.forEach((certificate) => {
          const date = new Date(certificate.createdAt || certificate.issueDate);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + 1);
        });

        const byMonth = Array.from(byMonthMap.entries())
          .map(([key, count]) => {
            const [year, month] = key.split('-').map(Number);
            return { year, month, count };
          })
          .sort(
            (a, b) =>
              new Date(a.year, a.month - 1).getTime() -
              new Date(b.year, b.month - 1).getTime()
          );

        const templateNameById = new Map(templates.map((template) => [template._id, template.name]));
        const templateCountMap = new Map<string, number>();

        certificates.forEach((certificate) => {
          const templateId =
            typeof certificate.templateId === 'string'
              ? certificate.templateId
              : certificate.templateId._id;
          templateCountMap.set(templateId, (templateCountMap.get(templateId) ?? 0) + 1);
        });

        const topUsed = Array.from(templateCountMap.entries())
          .map(([templateId, count]) => ({
            templateId,
            templateName: templateNameById.get(templateId) ?? 'Unknown',
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setAnalytics({
          certificates: {
            total: certificates.length,
            thisMonth: certificates.length,
            byMonth,
          },
          batch: {
            total: 0,
            completed: 0,
            successRate: 0,
          },
          templates: {
            customCount: templates.filter((template) => !template.isPublic).length,
            topUsed,
          },
        });
        setAnalyticsLoading(false);
        return;
      }

      setAnalyticsLoading(true);
      try {
        const result = await get<AnalyticsResponse>('/analytics');
        setAnalytics(result.data ?? null);
      } catch {
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [certificates, certsLoading, isDemoMode, templates, templatesLoading]);

  const trendData = useMemo<OverviewChartPoint[]>(
    () =>
      analytics?.certificates.byMonth.map((point) => ({
        month: new Date(point.year, point.month - 1).toLocaleDateString('en-US', {
          month: 'short',
        }),
        count: point.count,
      })) ?? [],
    [analytics]
  );

  const usageData = useMemo<UsageChartPoint[]>(
    () =>
      analytics?.templates.topUsed.map((point) => ({
        template: point.templateName,
        count: point.count,
      })) ?? [],
    [analytics]
  );

  const activeIntegrations = integrations.filter((integration) => integration.status === 'active');

  const stats = [
    {
      label: 'Certificates Issued',
      value: analytics?.certificates.total ?? certificates.length,
      note: `${analytics?.certificates.thisMonth ?? 0} this month`,
      icon: Award,
      tone: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      label: 'Templates Ready',
      value: templates.length,
      note: `${analytics?.templates.customCount ?? 0} custom`,
      icon: FileText,
      tone: 'text-accent bg-accent/10 border-accent/20',
    },
    {
      label: 'Connected Apps',
      value: integrations.length,
      note: `${activeIntegrations.length} active`,
      icon: Webhook,
      tone: 'text-info bg-info/10 border-info/20',
    },
    {
      label: 'Batch Success',
      value: `${Math.round(analytics?.batch.successRate ?? 0)}%`,
      note: `${analytics?.batch.completed ?? 0} completed jobs`,
      icon: TrendingUp,
      tone: 'text-success bg-success/10 border-success/20',
    },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 md:gap-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="relative overflow-hidden rounded border border-base-200 bg-base-100 p-8 shadow-sm md:p-12"
        >
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-12 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-base-content md:text-5xl">
                Welcome, {displayName.split(' ')[0]}. <br />
                <span className="text-primary">Verified Excellence.</span>
              </h1>
              <p className="mt-6 text-lg font-medium leading-relaxed text-base-content/60 lg:text-base">
                {workspaceName} is performing at optimal capacity. Manage high-volume issuance, track automation health, and verify achievements with precision.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <motion.div whileHover={{ y: -4 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.CREATE_CERTIFICATE} className="btn btn-primary h-14 rounded px-10 text-lg font-black shadow-xl shadow-primary/25">
                    Issue New
                    <ArrowRight size={20} className="ml-1" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.BATCH_GENERATE} className="btn btn-ghost h-14 rounded bg-base-200/50 px-8 text-lg font-black transition-colors hover:bg-base-200">
                    Batch Flow
                  </Link>
                </motion.div>
              </div>
            </div>

            <div className="grid w-full shrink-0 gap-4 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
              {[
                {
                  label: 'Automation Coverage',
                  value: `${activeIntegrations.length}/${integrations.length || 0}`,
                  note: 'active API connectors',
                  tone: 'bg-primary/5 border-primary/10 text-primary',
                },
                {
                  label: 'Certificates Month',
                  value: analytics?.certificates.thisMonth || 0,
                  note: 'issued records',
                  tone: 'bg-accent/5 border-accent/10 text-accent',
                },
                {
                  label: 'Success Rate',
                  value: `${Math.round(analytics?.batch.successRate ?? 0)}%`,
                  note: 'batch generation',
                  tone: 'bg-info/5 border-info/10 text-info',
                },
              ].map((item, idx) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SOFT_SPRING, delay: 0.2 + idx * 0.08 }}
                  whileHover={{ x: 6 }}
                  className={`rounded border ${item.tone} p-5 transition-all`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-2xl font-black tracking-tighter">
                      {item.value}
                    </p>
                    <p className="text-[10px] font-bold opacity-40 italic">{item.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <motion.article
              key={label}
              variants={REVEAL_ITEM}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={QUICK_SPRING}
              className="group relative flex flex-col justify-between overflow-hidden rounded border border-base-200 bg-base-100 p-6 shadow-sm transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                    {label}
                  </p>
                  <p className="mt-4 text-4xl font-black tracking-tight text-base-content">{value}</p>
                </div>
                <div className={`rounded border p-4 transition-transform group-hover:rotate-6 group-hover:scale-110 ${tone}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                 <p className="text-[11px] font-bold tracking-tight text-base-content/60">
                   {note}
                 </p>
              </div>
            </motion.article>
          ))}
        </motion.section>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                  Performance Analysis
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Issuance Trajectory
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded bg-base-200 text-base-content/40">
                 <TrendingUp size={22} />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Loading size="md" text="Scaling data points..." />
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ErrorBoundary>
                  <OverviewChart data={trendData} />
                </ErrorBoundary>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                  Classification
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Design Distribution
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded bg-base-200 text-base-content/40">
                 <FileText size={22} />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="flex h-[310px] items-center justify-center">
                <Loading size="md" text="Assembling mix..." />
              </div>
            ) : (
              <div className="h-[310px] w-full">
                <ErrorBoundary>
                  <UsageChart data={usageData} />
                </ErrorBoundary>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                  Infrastructure
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  System Health
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded bg-base-200 text-base-content/40">
                 <Zap size={22} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded border border-primary/20 bg-primary/5 p-6 border-dashed">
                <p className="text-[13px] font-bold leading-relaxed text-base-content/70">
                  {activeIntegrations.length > 0
                    ? `Your workspace is currently synced with ${activeIntegrations.length} external systems. API response times are optimal.`
                    : 'Infrastructure is dormant. Activate API tunnels or Webhooks to start flows.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div whileHover={{ y: -4 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.INTEGRATIONS} className="block group h-full rounded border border-base-200 bg-base-200/20 p-6 transition-all hover:bg-base-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-base-content">System API</h3>
                      <Webhook size={18} className="text-base-content/20 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mt-3 text-[11px] font-medium leading-relaxed text-base-content/40">
                      Configure inbound webhooks and tokens.
                    </p>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.BATCH_GENERATE} className="block group h-full rounded border border-base-200 bg-base-200/20 p-6 transition-all hover:bg-base-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-base-content">Batch Processing</h3>
                      <ArrowRight size={18} className="text-base-content/20 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mt-3 text-[11px] font-medium leading-relaxed text-base-content/40">
                      Orchestrate large-scale jobs via CSV.
                    </p>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm overflow-hidden"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                  Verification Records
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Issuance Ledger
                </h2>
              </div>
              <Link
                to={ROUTES.CERTIFICATES}
                className="btn btn-ghost btn-sm text-primary"
              >
                View Full
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loading size="md" text="Indexing records..." />
              </div>
            ) : recentCertificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Award size={48} className="mb-4 text-base-content/10" />
                <h3 className="text-lg font-black text-base-content">Ledger is empty</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-base-content/50">
                  Institutional issuance activity will be logged here.
                </p>
                <Link to={ROUTES.TEMPLATES} className="btn btn-primary mt-8">
                  Pick a Template
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="border-b border-base-200 bg-base-200/30 text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                      <th className="py-5 px-6">Identified Recipient</th>
                      <th className="py-5">Title of Record</th>
                      <th className="py-5">Date</th>
                      <th className="py-5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    <AnimatePresence>
                      {recentCertificates.map((certificate, idx) => (
                        <motion.tr 
                          key={certificate._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 + 0.1 }}
                          className="group border-none transition-colors hover:bg-base-200/50"
                        >
                          <td className="py-6 px-6">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-base-200 flex items-center justify-center text-[10px] font-black">
                                   {certificate.recipientName.charAt(0)}
                                </div>
                                <span className="font-bold tracking-tight text-base-content">{certificate.recipientName}</span>
                             </div>
                          </td>
                          <td className="py-6 text-[13px] font-bold text-base-content/60">{certificate.certificateTitle}</td>
                          <td className="py-6 text-[13px] font-bold text-base-content/40">{formatDateShort(certificate.issueDate)}</td>
                          <td className="py-6 px-6 text-right">
                            <span
                              className={`badge rounded badge-sm font-black uppercase tracking-wider py-3 px-4 ${
                                certificate.pdfUrl
                                  ? 'badge-success text-success-content'
                                  : 'badge-ghost text-base-content/40'
                              }`}
                            >
                              {certificate.pdfUrl ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
