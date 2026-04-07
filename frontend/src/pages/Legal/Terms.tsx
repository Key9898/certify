import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, FileText, FileCheck, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

const TERM_SECTIONS = [
  {
    title: "Acceptance of Terms",
    icon: FileCheck,
    content: "By creating an account and using the Certify platform, you agree to these legal terms and conditions. If you disagree with any part, you must not use our services."
  },
  {
    title: "User Responsibilities",
    icon: Info,
    content: "Users are responsible for ensuring that they have the legal right to issue any certificate they create. Misuse of the platform for fraudulent purposes will result in account termination."
  },
  {
    title: "Platform Rights",
    icon: ShieldAlert,
    content: "Certify reserves the right to modify, suspend, or terminate services at any time. We also reserve the right to remove any content that violates our community guidelines."
  },
  {
    title: "Limitation of Liability",
    icon: ShieldAlert,
    content: "Certify is provided 'as is'. We are not liable for any indirect, incidental, or physical damages resulting from the use or inability to use our platform."
  }
];

export const Terms: React.FC = () => {
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
        {/* Modern Terms Hero */}
        <section className="mb-24 relative overflow-hidden p-12 md:p-20 rounded bg-slate-950 text-white border border-white/5">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                variants={REVEAL_ITEM}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white/10 text-amber-500 font-black text-xs uppercase tracking-[0.2em] mb-8"
              >
                <FileText size={14} />
                <span>Legal Framework</span>
              </motion.div>

              <motion.h1 
                variants={REVEAL_ITEM}
                className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8"
              >
                Terms of <br className="hidden md:block" /> Service.
              </motion.h1>

              <motion.div
                variants={REVEAL_ITEM}
                className="flex items-center justify-center md:justify-start gap-4 text-white/40 font-bold uppercase tracking-widest text-xs"
              >
                <Clock size={14} />
                <span>Last Updated: April 7, 2026</span>
              </motion.div>
            </div>

            <div className="hidden lg:flex w-48 h-48 rounded border border-white/10 bg-white/5 backdrop-blur-md items-center justify-center text-amber-500 shadow-2xl animate-float">
                <FileCheck size={80} />
            </div>
          </div>
        </section>

        {/* Structured Legal Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-32">
          {/* Main Content */}
          <section className="md:col-span-8 space-y-16">
            {TERM_SECTIONS.map((section, idx) => (
              <motion.div key={idx} variants={REVEAL_ITEM} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded bg-amber-500/10 text-amber-700">
                    <section.icon size={22} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">{section.title}</h2>
                </div>
                <p className="text-xl font-medium leading-relaxed text-base-content/60">
                    {section.content}
                </p>
                <div className="mt-8 h-px w-full bg-base-200" />
              </motion.div>
            ))}
            
            <motion.div variants={REVEAL_ITEM} className="p-10 rounded bg-slate-900 text-white">
                <h3 className="text-2xl font-black tracking-tighter mb-4">Have Questions?</h3>
                <p className="opacity-70 mb-8 font-medium">Contact our legal representative for further clarification on these terms.</p>
                <a href="mailto:legal@certify.ink" className="btn btn-warning px-8 rounded font-black text-white">
                  legal@certify.ink
                </a>
            </motion.div>
          </section>

          {/* Sidebar */}
          <aside className="md:col-span-4 hidden md:block">
            <div className="sticky top-32 space-y-12">
               <div className="p-8 rounded bg-amber-50 border border-amber-200">
                  <h4 className="font-black uppercase tracking-[0.2em] text-xs text-amber-700 mb-8">Quick Navigation</h4>
                  <ul className="space-y-4">
                    {TERM_SECTIONS.map((s, i) => (
                        <li key={i}>
                            <a href="#" className="font-bold text-sm text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded bg-amber-500/30" />
                                {s.title}
                            </a>
                        </li>
                    ))}
                  </ul>
               </div>

               <div className="p-8 rounded bg-amber-500/5 border border-amber-500/20">
                  <ShieldAlert className="text-amber-600 mb-4" size={24} />
                  <p className="text-sm font-bold text-base-content/70 leading-relaxed italic">
                    "Transparency is the foundation of our trust. These terms protect both the issuer and the recipient."
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
