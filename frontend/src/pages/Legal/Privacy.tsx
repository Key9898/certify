import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Clock,
  Lock,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

const formatCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const POLICY_SECTIONS = [
  {
    title: 'Data Collection',
    icon: Mail,
    content:
      'We collect information you provide directly to us when creating an account, including your organization name, email address, and any branding assets (logos/signatures) you upload.',
  },
  {
    title: 'Information Usage',
    icon: ShieldCheck,
    content:
      'Your data is used solely to generate and verify certificates. We do not sell your data to third parties. We use your email for critical account alerts and platform updates.',
  },
  {
    title: 'Data Storage & Security',
    icon: Lock,
    content:
      'We implement industry-standard encryption and security measures. All assets are stored securely on Cloudinary and MongoDB-protected environments.',
  },
  {
    title: 'User Rights',
    icon: ShieldAlert,
    content:
      'You have the right to access, export, or delete your data at any time. To request data deletion, please contact our support team at support@certify.ink.',
  },
];

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header />
      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="container mx-auto px-4 md:px-6 max-w-5xl py-24 flex-1"
      >
        {/* Modern Policy Hero */}
        <section className="mb-24 relative overflow-hidden p-12 md:p-20 rounded bg-slate-950 text-white border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                variants={REVEAL_ITEM}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/10 text-primary font-black text-xs uppercase tracking-[0.2em] mb-8"
              >
                <ShieldCheck size={14} />
                <span>Security Assurance</span>
              </motion.div>

              <motion.h1
                variants={REVEAL_ITEM}
                className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8"
              >
                Privacy <br className="hidden md:block" /> Policy.
              </motion.h1>

              <motion.div
                variants={REVEAL_ITEM}
                className="flex items-center justify-center md:justify-start gap-4 text-white/40 font-bold uppercase tracking-widest text-xs"
              >
                <Clock size={14} />
                <span>Last Updated: {formatCurrentDate()}</span>
              </motion.div>
            </div>

            <div className="hidden lg:flex w-48 h-48 rounded border border-white/10 bg-white/5 backdrop-blur-md items-center justify-center text-primary shadow-2xl animate-float">
              <ShieldCheck size={80} />
            </div>
          </div>
        </section>

        {/* Structured Legal Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-32">
          {/* Main Content */}
          <section className="md:col-span-8 space-y-16">
            {POLICY_SECTIONS.map((section, idx) => (
              <motion.div key={idx} variants={REVEAL_ITEM} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded bg-primary/10 text-primary">
                    <section.icon size={22} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">
                    {section.title}
                  </h2>
                </div>
                <p className="text-xl font-medium leading-relaxed text-base-content/60">
                  {section.content}
                </p>
                <div className="mt-8 h-px w-full bg-base-200" />
              </motion.div>
            ))}

            <motion.div
              variants={REVEAL_ITEM}
              className="p-10 rounded bg-slate-900 text-white"
            >
              <h3 className="text-2xl font-black tracking-tighter mb-4">
                Contact Our Privacy Lead
              </h3>
              <p className="opacity-70 mb-8 font-medium">
                For any inquiries regarding data protection and GDPR compliance.
              </p>
              <a
                href="mailto:privacy@certify.ink"
                className="btn btn-primary px-8 rounded font-black"
              >
                privacy@certify.ink
              </a>
            </motion.div>
          </section>

          {/* Sidebar / Table of Contents */}
          <aside className="md:col-span-4 hidden md:block">
            <div className="sticky top-32 space-y-12">
              <div className="p-8 rounded bg-base-200 border border-base-200">
                <h4 className="font-black uppercase tracking-[0.2em] text-xs text-primary mb-8">
                  Quick Access
                </h4>
                <ul className="space-y-4">
                  {POLICY_SECTIONS.map((s, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="font-bold text-sm text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded bg-primary/30" />
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded bg-primary/5 border border-primary/20">
                <FileText className="text-primary mb-4" size={24} />
                <p className="text-sm font-bold text-base-content/70 leading-relaxed italic">
                  "We believe your data is your property. Our platform is built
                  to respect that fundamental right."
                </p>
              </div>
            </div>
          </aside>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};
