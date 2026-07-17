import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  FileCheck,
  Lock,
  Globe,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VerifySearchWidget } from '@/components/common/VerifySearchWidget/VerifySearchWidget';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

export const VerifyPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative z-10 selection:bg-primary/20">
      <Header />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f8fafc]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      </div>

      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="container mx-auto px-4 md:px-6 relative z-10 py-20 flex-1"
      >
        {/* Core Verification Hero */}
        <section className="text-center mb-24 max-w-5xl mx-auto">
          <motion.div
            variants={REVEAL_ITEM}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-[0.25em] mb-10 shadow-sm border border-indigo-100/80"
          >
            <ShieldCheck size={16} />
            <span>Official Identity Gateway</span>
          </motion.div>

          <motion.h1
            variants={REVEAL_ITEM}
            className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8"
          >
            Verify <br className="hidden md:block" />{' '}
            <span className="bg-gradient-to-r from-primary to-indigo-700 bg-clip-text text-transparent">
              Authenticity.
            </span>
          </motion.h1>

          <motion.p
            variants={REVEAL_ITEM}
            className="text-lg md:text-2xl font-semibold text-slate-500 mb-14 leading-relaxed max-w-2xl mx-auto"
          >
            Instantly validate any certificate issued via the Qubit Certify
            platform. Enter the unique ID below to begin the audit.
          </motion.p>

          <motion.div
            variants={REVEAL_ITEM}
            className="flex justify-center p-8 rounded-lg bg-white border border-slate-200 shadow-xl max-w-3xl mx-auto"
          >
            <VerifySearchWidget variant="large" />
          </motion.div>
        </section>

        {/* Global Stats / Trust Indicators */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-28 p-8 rounded-lg bg-white border border-slate-200 shadow-sm">
          {[
            { label: 'Verified Claims', value: 'Unlimited', icon: CheckCircle },
            { label: 'Registry Health', value: '100%', icon: Zap },
            { label: 'Global Nodes', value: 'Instant', icon: Globe },
            { label: 'Security', value: 'SSL+AES', icon: Lock },
          ].map((stat, i) => (
            <motion.div key={i} variants={REVEAL_ITEM} className="text-center">
              <div className="flex justify-center mb-4 text-primary">
                <stat.icon size={24} />
              </div>
              <div className="text-2xl font-black tracking-tighter text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Feature Experience Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-28">
          {[
            {
              icon: Search,
              title: 'Blockchain-Ready Registry',
              desc: 'Every certificate metadata is optimized for immutable verification.',
              v: 'bg-primary/10 text-primary border border-primary/20',
            },
            {
              icon: Lock,
              title: 'Tamper-Proof DNA',
              desc: 'Digital signatures detect even the smallest bit modification in the document.',
              v: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
            },
            {
              icon: FileCheck,
              title: 'Official Verification Badge',
              desc: 'Validated records get a public link and an embeddable badge for LinkedIn.',
              v: 'bg-success/10 text-success border border-success/20',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={REVEAL_ITEM}
              whileHover={{ y: -4 }}
              className="p-10 rounded-lg bg-white border border-slate-200 group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div
                className={`w-14 h-14 rounded ${feature.v} flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                <feature.icon size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="font-semibold text-slate-500 leading-relaxed transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Immersive How-To Section */}
        <motion.section
          variants={REVEAL_ITEM}
          className="relative max-w-6xl mx-auto p-12 md:p-20 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm backdrop-blur-sm"
        >
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight text-slate-900">
                  Locate your <br /> Certificate ID.
                </h2>
                <p className="text-lg text-slate-500 font-semibold mb-10 leading-relaxed">
                  Every credential carries a unique identifier. This ID is your
                  key to proving authenticity to employers or institutions
                  worldwide.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      step: '01',
                      text: 'Download your official PDF/PNG from Qubit Certify.',
                    },
                    {
                      step: '02',
                      text: 'Look for the unique ID in the bottom corner.',
                    },
                    {
                      step: '03',
                      text: 'Paste it here for instant global validation.',
                    },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-5 items-center">
                      <div className="text-primary font-black text-xl">
                        {s.step}
                      </div>
                      <div className="font-bold text-slate-600">{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[440px] shrink-0">
                <div className="aspect-[1.414/1] bg-slate-50/50 border border-slate-200 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden shadow-sm group backdrop-blur-sm">
                  {/* Decorative Frame */}
                  <div className="absolute inset-2.5 border border-indigo-200 rounded pointer-events-none" />
                  <div className="absolute inset-3 border border-dashed border-indigo-100 rounded pointer-events-none" />
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-primary/5 rounded-full blur-[30px] pointer-events-none" />

                  {/* Top: Header */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                        Qubit Certify
                      </div>
                      <div className="text-[12px] font-black text-slate-950 tracking-tight">
                        Official Credential
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                      QC
                    </div>
                  </div>

                  {/* Middle: Content Mock */}
                  <div className="relative z-10 my-2 text-center">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      This is to certify that
                    </div>
                    <div className="text-sm font-black text-slate-900 tracking-tight italic font-serif mb-1">
                      WUNNA AUNG
                    </div>
                    <div className="text-[7px] font-medium text-slate-500 max-w-[200px] mx-auto leading-tight">
                      has successfully completed all requirements for the
                      official credential verification audit.
                    </div>
                  </div>

                  {/* Bottom: Signatures and ID Badge */}
                  <div className="relative z-10 flex justify-between items-end border-t border-slate-200 pt-2.5">
                    <div className="flex gap-4">
                      <div>
                        <div className="h-4 w-12 border-b border-slate-300 opacity-60 mb-1" />
                        <div className="text-[6px] font-black uppercase tracking-widest text-slate-500">
                          Registrar
                        </div>
                      </div>
                      <div>
                        <div className="h-4 w-12 border-b border-slate-300 opacity-60 mb-1" />
                        <div className="text-[6px] font-black uppercase tracking-widest text-slate-500">
                          Authority
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-2.5 py-1 rounded bg-primary text-white font-black text-[9px] tracking-wider shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 inline-block">
                        CERT-98234-A
                      </div>
                      <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        Verified ID Position
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>
      <Footer />
    </div>
  );
};
