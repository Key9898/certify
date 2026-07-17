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
    <div
      className="min-h-screen bg-base-100 flex flex-col relative z-10 selection:bg-primary/30"
      style={
        {
          '--color-base-100': 'oklch(12% 0.015 256)',
          '--color-base-200': 'oklch(20% 0.025 256)',
          '--color-base-300': 'oklch(28% 0.03 256)',
          '--color-base-content': 'oklch(96% 0.005 256)',
          '--color-primary': 'oklch(56% 0.18 250)', // Rich indigo primary
          '--color-accent': 'oklch(62% 0.12 200)', // Teal/blue accent
          '--radius-box': '0.5rem', // Softer rounded corners (0.5rem)
          '--radius-selector': '0.5rem',
          '--radius-field': '0.5rem',
        } as React.CSSProperties
      }
    >
      <Header />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#040612]">
        <div
          className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] bg-primary/5 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-accent/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '15s' }}
        />
      </div>

      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="container mx-auto px-4 md:px-6 relative z-10 py-24 flex-1"
      >
        {/* Core Verification Hero */}
        <section className="text-center mb-28 max-w-5xl mx-auto">
          <motion.div
            variants={REVEAL_ITEM}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.25em] mb-10 shadow-lg shadow-primary/5 border border-primary/10"
          >
            <ShieldCheck size={16} />
            <span>Official Identity Gateway</span>
          </motion.div>

          <motion.h1
            variants={REVEAL_ITEM}
            className="text-6xl md:text-8xl font-black text-base-content leading-[0.9] tracking-tighter mb-10"
          >
            Verify <br className="hidden md:block" />{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Authenticity.
            </span>
          </motion.h1>

          <motion.p
            variants={REVEAL_ITEM}
            className="text-lg md:text-2xl font-medium text-base-content/60 mb-16 leading-relaxed max-w-2xl mx-auto"
          >
            Instantly validate any certificate issued via the Qubit Certify
            platform. Enter the unique ID below to begin the audit.
          </motion.p>

          <motion.div
            variants={REVEAL_ITEM}
            className="flex justify-center p-8 rounded-lg bg-base-200/25 border border-base-200/40 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] max-w-3xl mx-auto"
          >
            <VerifySearchWidget variant="large" />
          </motion.div>
        </section>

        {/* Global Stats / Trust Indicators */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-36 p-8 rounded-lg bg-base-200/10 border border-base-200/30 backdrop-blur-sm">
          {[
            { label: 'Verified Claims', value: 'Unlimited', icon: CheckCircle },
            { label: 'Registry Health', value: '100%', icon: Zap },
            { label: 'Global Nodes', value: 'Instant', icon: Globe },
            { label: 'Security', value: 'SSL+AES', icon: Lock },
          ].map((stat, i) => (
            <motion.div key={i} variants={REVEAL_ITEM} className="text-center">
              <div className="flex justify-center mb-4 text-primary opacity-60">
                <stat.icon size={24} />
              </div>
              <div className="text-2xl font-black tracking-tighter text-base-content mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Feature Experience Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-36">
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
              v: 'bg-accent/10 text-accent border border-accent/20',
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
              whileHover={{ y: -6 }}
              className="p-10 rounded-lg bg-base-200/15 border border-base-200/30 backdrop-blur-md group hover:bg-base-200/30 hover:border-primary/30 transition-all duration-300 shadow-2xl"
            >
              <div
                className={`w-14 h-14 rounded ${feature.v} flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                <feature.icon size={26} />
              </div>
              <h3 className="text-xl font-black text-base-content mb-3 tracking-tight transition-colors">
                {feature.title}
              </h3>
              <p className="font-semibold text-base-content/50 leading-relaxed transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Immersive How-To Section */}
        <motion.section
          variants={REVEAL_ITEM}
          className="relative max-w-6xl mx-auto p-12 md:p-20 rounded-lg bg-gradient-to-br from-base-200/40 to-base-100/20 border border-base-200/40 overflow-hidden shadow-3xl backdrop-blur-sm"
        >
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                  Locate your <br /> Certificate ID.
                </h2>
                <p className="text-lg text-base-content/60 font-semibold mb-10 leading-relaxed">
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
                      <div className="font-bold text-base-content/80">
                        {s.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[380px] shrink-0">
                <div className="aspect-[3/4] bg-base-100/10 rounded-lg border border-base-200/40 p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md group shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="h-5 w-1/3 bg-base-content/15 rounded mb-4 animate-pulse" />
                    <div className="h-3 w-2/3 bg-base-content/10 rounded mb-8 animate-pulse" />
                    <div className="space-y-4">
                      <div className="h-2 w-full bg-base-content/10 rounded" />
                      <div className="h-2 w-full bg-base-content/10 rounded" />
                      <div className="h-2 w-2/3 bg-base-content/10 rounded" />
                    </div>
                  </div>

                  <div className="relative z-10 pt-12">
                    <div className="p-4 rounded bg-primary text-white font-black text-center text-sm shadow-xl shadow-primary/20 mb-4 transition-transform duration-300 group-hover:scale-[1.03]">
                      CERT-98234-A
                    </div>
                    <p className="text-[10px] text-center font-black uppercase tracking-widest text-base-content/30">
                      Verified Identifier Position
                    </p>
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
