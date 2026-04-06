import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  FileText,
  Sparkles,
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
import { formatDateShort } from '@/utils/formatters';
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
  const totalIntegrationRuns = integrations.reduce(
    (sum, integration) => sum + integration.stats.totalRuns,
    0
  );

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
      <div className="space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="relative overflow-hidden rounded border border-base-200 bg-base-100 shadow-2xl shadow-base-300/10"
        >
          <motion.div 
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[1.3fr_1fr] lg:px-12 lg:py-14">
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SOFT_SPRING, delay: 0.1 }}
                className="inline-flex w-fit items-center gap-2 rounded border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-primary"
              >
                <Sparkles size={14} />
                Workspace Operational
              </motion.div>
              <h1 className="mt-8 text-4xl font-black leading-[1.05] tracking-tight text-base-content md:text-5xl">
                Welcome, {user?.name?.split(' ')[0] || 'Member'}.
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-base-content/60">
                {workspaceName} is optimized for high-volume issuance and seamless workflow automation. Manage yours from this central hub.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <motion.div whileHover={{ y: -4 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.CREATE_CERTIFICATE} className="btn btn-primary h-14 rounded-sm px-10 text-lg font-black shadow-xl shadow-primary/25">
                    Issue New
                    <ArrowRight size={20} className="ml-1" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.BATCH_GENERATE} className="btn btn-ghost h-14 rounded-sm bg-base-200/50 px-8 text-lg font-black transition-colors hover:bg-base-200">
                    Batch Flow
                  </Link>
                </motion.div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  label: 'Automation coverage',
                  value: `${activeIntegrations.length}/${integrations.length || 0}`,
                  note: 'live API connections',
                  bg: 'bg-primary/5',
                },
                {
                  label: 'Webhook traffic',
                  value: totalIntegrationRuns.toLocaleString(),
                  note: 'total inbound requests',
                  bg: 'bg-accent/5',
                },
                {
                  label: 'Top template',
                  value: analytics?.templates.topUsed[0]?.templateName || 'None',
                  note: 'most active design',
                  bg: 'bg-info/5',
                },
              ].map((item, idx) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SOFT_SPRING, delay: 0.2 + idx * 0.08 }}
                  whileHover={{ x: 6, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                  className={`rounded border border-base-200 ${item.bg} p-5 shadow-sm transition-colors`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                    {item.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-black tracking-tighter text-base-content">
                      {item.value}
                    </p>
                    <p className="mb-0.5 text-xs font-bold text-base-content/55 italic">{item.note}</p>
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
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <motion.article
              key={label}
              variants={REVEAL_ITEM}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={QUICK_SPRING}
              className="group relative overflow-hidden rounded border border-base-200 bg-base-100 p-6 shadow-sm ring-1 ring-base-200/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-base-200/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                    {label}
                  </p>
                  <p className="mt-4 text-4xl font-black tracking-tight text-base-content leading-none">{value}</p>
                </div>
                <div className={`rounded border p-3.5 transition-transform group-hover:rotate-6 group-hover:scale-110 ${tone}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="relative mt-5 text-[11px] font-bold tracking-tight text-base-content/60">
                <span className="text-primary mr-1">●</span> {note}
              </p>
            </motion.article>
          ))}
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Performance Metrics
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Issuance Momentum
                </h2>
              </div>
              <div className="rounded-full bg-primary/10 p-4 text-primary shadow-inner">
                <TrendingUp size={20} />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Loading size="md" text="Analyzing flows..." />
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Asset Mix
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Template Usage
                </h2>
              </div>
              <div className="rounded-full bg-accent/10 p-4 text-accent shadow-inner">
                <FileText size={20} />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="flex h-[280px] items-center justify-center">
                <Loading size="md" text="Fetching mix..." />
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ErrorBoundary>
                  <UsageChart data={usageData} />
                </ErrorBoundary>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Integrations Hub
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  External Health
                </h2>
              </div>
              <div className="rounded-full bg-info/10 p-4 text-info shadow-inner">
                <Zap size={20} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded border border-base-200 bg-base-200/40 p-5 shadow-inner">
                <p className="text-[13px] font-bold leading-relaxed text-base-content/70">
                  {activeIntegrations.length > 0
                    ? `${activeIntegrations.length} live endpoints are actively listening for triggers. API coverage is stable.`
                    : 'Your workspace has no active integrations. Connect to LMS or No-code tools to automate delivery.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,1)' }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.INTEGRATIONS} className="block h-full rounded border border-base-200 bg-base-100/50 p-5 shadow-sm transition-colors hover:border-primary/40">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-base-content">Configure API</h3>
                      <Webhook size={16} className="text-primary" />
                    </div>
                    <p className="mt-3 text-xs font-medium leading-relaxed text-base-content/50">
                      Manage webhooks and automation keys.
                    </p>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,1)' }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link to={ROUTES.BATCH_GENERATE} className="block h-full rounded border border-base-200 bg-base-100/50 p-5 shadow-sm transition-colors hover:border-primary/40">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-base-content">Batch Flow</h3>
                      <ArrowRight size={16} className="text-primary" />
                    </div>
                    <p className="mt-3 text-xs font-medium leading-relaxed text-base-content/50">
                      Large-scale manual generation via CSV.
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
            className="rounded border border-base-200 bg-base-100 p-8 shadow-sm"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  Recent Issuance
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-base-content">
                  Live Activity
                </h2>
              </div>
              <Link
                to={ROUTES.CERTIFICATES}
                className="btn btn-ghost btn-sm rounded-sm text-[10px] font-black uppercase tracking-widest text-primary"
              >
                Full Ledger
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loading size="md" text="Streaming logs..." />
              </div>
            ) : recentCertificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded border border-dashed border-base-300 bg-base-200/20 px-8 py-16 text-center">
                <Award size={48} className="mb-4 text-base-content/10" />
                <h3 className="text-lg font-black text-base-content">Ledger stands empty</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-base-content/50">
                  Ready to issue your first verified record?
                </p>
                <Link to={ROUTES.TEMPLATES} className="btn btn-primary mt-8 rounded-sm font-black px-10">
                  Pick a Template
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-md w-full">
                  <thead>
                    <tr className="border-b border-base-200 bg-base-200/5 text-[10px] font-black uppercase tracking-[0.28em] text-base-content/40">
                      <th className="py-4">Recipient</th>
                      <th className="py-4">Title</th>
                      <th className="py-4">Issued</th>
                      <th className="py-4 pr-0 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    <AnimatePresence>
                      {recentCertificates.map((certificate, idx) => (
                        <motion.tr 
                          key={certificate._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group border-none transition-colors hover:bg-base-200/30"
                        >
                          <td className="py-5 font-bold tracking-tight text-base-content">{certificate.recipientName}</td>
                          <td className="py-5 text-sm font-medium text-base-content/60">{certificate.certificateTitle}</td>
                          <td className="py-5 text-sm font-medium text-base-content/40">{formatDateShort(certificate.issueDate)}</td>
                          <td className="py-5 pr-0 text-right">
                            <span
                              className={`badge rounded-sm border-none px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                certificate.pdfUrl
                                  ? 'bg-success/10 text-success'
                                  : 'bg-base-300 text-base-content/40'
                              }`}
                            >
                              {certificate.pdfUrl ? 'Ready' : 'Pending'}
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
