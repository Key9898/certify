import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Building2,
  Calendar,
  BadgeCheck,
  CircleAlert,
  CircleX,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VerifySearchWidget } from '@/components/common/VerifySearchWidget/VerifySearchWidget';
import { ROUTES } from '@/utils/constants';
import { Link } from 'react-router-dom';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

const RESULT_FIELDS = [
  { icon: BadgeCheck, label: 'Recipient name' },
  { icon: FileText, label: 'Certificate title' },
  { icon: Building2, label: 'Issuing organization' },
  { icon: Calendar, label: 'Issue date' },
  { icon: ShieldCheck, label: 'Verification status' },
] as const;

const STATUS_LEGEND = [
  {
    icon: BadgeCheck,
    title: 'Valid',
    desc: 'The credential is active and matches a record in the registry.',
    tone: 'text-success bg-success/10 border-success/20',
  },
  {
    icon: CircleAlert,
    title: 'Revoked',
    desc: 'The issuer has withdrawn this credential. It is no longer valid.',
    tone: 'text-warning bg-warning/10 border-warning/25',
  },
  {
    icon: CircleX,
    title: 'Not found',
    desc: 'No matching ID was found. Check the ID and try again.',
    tone: 'text-error bg-error/10 border-error/20',
  },
] as const;

export const VerifyPortal: React.FC = () => {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-[#F7F8FA] selection:bg-primary/15">
      <Header />

      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 md:py-24"
      >
        {/* Hero — one job: verify */}
        <section className="mb-20 max-w-3xl md:mb-28">
          <motion.p
            variants={REVEAL_ITEM}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
          >
            Document verification
          </motion.p>

          <motion.h1
            variants={REVEAL_ITEM}
            className="mb-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
          >
            Verify a Qubit Certify credential
          </motion.h1>

          <motion.p
            variants={REVEAL_ITEM}
            className="mb-10 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg"
          >
            Enter the certificate ID printed on the document or scanned from its
            QR code. You will see whether the credential is valid, revoked, or
            not found.
          </motion.p>

          <motion.div variants={REVEAL_ITEM} className="mb-5">
            <VerifySearchWidget
              variant="large"
              placeholder="Certificate ID (12 characters)"
            />
          </motion.div>

          <motion.div
            variants={REVEAL_ITEM}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500"
          >
            <span>
              Example format:{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">
                AB12CD34EF56
              </code>
            </span>
            <a
              href="#find-id"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Where is my ID?
            </a>
          </motion.div>
        </section>

        {/* What verification shows */}
        <motion.section
          variants={REVEAL_ITEM}
          className="mb-16 border-t border-slate-200 pt-14 md:mb-20 md:pt-16"
        >
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            What you will see
          </h2>
          <p className="mb-8 max-w-2xl text-slate-600">
            A successful lookup returns the public fields needed to confirm the
            credential — nothing more.
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {RESULT_FIELDS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded border border-slate-200 bg-white px-4 py-3.5"
              >
                <Icon
                  size={18}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* How to find ID + annotated mock */}
        <motion.section
          id="find-id"
          variants={REVEAL_ITEM}
          className="mb-16 scroll-mt-24 md:mb-20"
        >
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="border-b border-slate-200 p-8 md:p-10 lg:border-b-0 lg:border-r">
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  Where to find your certificate ID
                </h2>
                <p className="mb-8 text-slate-600 leading-relaxed">
                  Every issued PDF or PNG includes a unique 12-character ID and
                  a QR code that opens this verification page.
                </p>
                <ol className="space-y-5">
                  {[
                    'Open the official PDF or PNG from the issuer.',
                    'Find the ID near the bottom of the certificate (or scan the QR).',
                    'Paste the ID above to check authenticity.',
                  ].map((text, i) => (
                    <li key={text} className="flex gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 font-medium text-slate-700">
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-center bg-[#F7F8FA] p-8 md:p-10">
                <div className="aspect-[1.414/1] w-full max-w-md rounded border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-full flex-col justify-between rounded border border-slate-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Qubit Certify
                        </p>
                        <p className="text-xs font-semibold text-slate-900">
                          Official credential
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-50 text-[9px] font-semibold text-slate-500">
                        QR
                      </div>
                    </div>

                    <div className="py-2 text-center">
                      <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-slate-500">
                        This is to certify that
                      </p>
                      <p className="font-serif text-base font-semibold italic text-slate-900">
                        Recipient Name
                      </p>
                      <p className="mx-auto mt-1 max-w-[220px] text-[9px] leading-snug text-slate-500">
                        has completed the requirements for this credential.
                      </p>
                    </div>

                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div className="space-y-1">
                        <div className="h-3 w-14 border-b border-slate-300" />
                        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                          Signature
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-block rounded bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-white ring-2 ring-primary/25 ring-offset-2">
                          AB12CD34EF56
                        </div>
                        <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-wider text-primary">
                          ← Certificate ID
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Status meanings */}
        <motion.section
          variants={REVEAL_ITEM}
          className="mb-16 md:mb-20"
        >
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Status meanings
          </h2>
          <p className="mb-8 max-w-2xl text-slate-600">
            After you submit an ID, the result page shows one of these outcomes.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STATUS_LEGEND.map(({ icon: Icon, title, desc, tone }) => (
              <div
                key={title}
                className="rounded border border-slate-200 bg-white p-6"
              >
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs font-semibold ${tone}`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {title}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Trust & privacy */}
        <motion.section
          variants={REVEAL_ITEM}
          className="rounded border border-slate-200 bg-white p-8 md:p-10"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <HelpCircle size={18} aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Trust & privacy
                </h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                Qubit Certify publishes only the fields needed to confirm a
                credential. Private account data is never shown on this public
                page. Lookups are rate-limited to protect the registry.
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                Need help or want to report a suspicious document?{' '}
                <Link
                  to={ROUTES.FAQ}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Read the FAQs
                </Link>{' '}
                or contact support.
              </p>
            </div>
            <a
              href="mailto:support@certify.ink"
              className="inline-flex shrink-0 items-center gap-2 rounded border border-slate-200 bg-[#F7F8FA] px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Mail size={16} aria-hidden="true" />
              support@certify.ink
            </a>
          </div>
        </motion.section>
      </motion.main>

      <Footer />
    </div>
  );
};
