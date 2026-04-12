import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  User,
  CheckCircle,
  Target,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header />
      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="container mx-auto px-4 md:px-6 max-w-6xl py-24 flex-1"
      >
        {/* Immersive Hero */}
        <section className="text-center mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-primary/5 rounded-full blur-[120px] -z-10" />

          <motion.div
            variants={REVEAL_ITEM}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.2em] mb-8"
          >
            <Award size={14} />
            <span>Redefining Recognition</span>
          </motion.div>

          <motion.h1
            variants={REVEAL_ITEM}
            className="text-6xl md:text-8xl font-black text-base-content leading-[0.9] tracking-tighter mb-10"
          >
            Trust in Every <br className="hidden md:block" /> Digital Record.
          </motion.h1>

          <motion.p
            variants={REVEAL_ITEM}
            className="text-xl md:text-2xl font-medium text-base-content/60 leading-relaxed max-w-3xl mx-auto"
          >
            Certify was born from a simple observation: achievements are
            valuable, but their proof is often fragmented and uncertain. We
            bridge that gap.
          </motion.p>
        </section>

        {/* Brand Story & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-40 items-start">
          <motion.div variants={REVEAL_ITEM} className="space-y-12">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-primary/10 text-primary">
                <Target size={24} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-6">
                Our Mission
              </h2>
              <p className="text-lg font-medium leading-relaxed text-base-content/70">
                To provide a decentralized, beautiful, and effortless
                environment where every accomplishment—from a workshop
                mini-course to a corporate leadership program—is verifiable
                instantly and securely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Design-First', icon: Heart },
                { title: 'Secure-by-Default', icon: ShieldCheck },
              ].map((val, i) => (
                <div
                  key={i}
                  className="p-6 rounded bg-base-200/50 border border-base-200"
                >
                  <val.icon className="text-primary mb-4" size={24} />
                  <h3 className="font-black text-sm uppercase tracking-widest">
                    {val.title}
                  </h3>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={REVEAL_ITEM} className="relative">
            <div className="rounded bg-base-200 aspect-[4/5] overflow-hidden border border-base-200 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                alt="Workspace"
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute bottom-8 left-8 right-8 p-8 rounded bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <p className="text-2xl font-black tracking-tighter mb-2">
                  Since {new Date().getFullYear()}
                </p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest text-white/70">
                  Leading the Digital Identity Wave
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech Specs */}
        <section className="mb-40 py-20 border-y border-base-200">
          <motion.div variants={REVEAL_ITEM} className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter mb-4">
              Core Infrastructure
            </h2>
            <p className="text-base-content/50 font-bold uppercase tracking-widest text-sm">
              Built for Scalability and Integrity
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              'Distributed Registry',
              'Dynamic PNG Injection',
              'Immutable PDF Signing',
              'Multi-tenant Access',
            ].map((tech, i) => (
              <motion.div
                key={i}
                variants={REVEAL_ITEM}
                className="text-center"
              >
                <div className="text-primary font-black text-2xl mb-2">
                  0{i + 1}
                </div>
                <div className="font-bold text-base-content/80 text-sm uppercase tracking-wide">
                  {tech}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Founder Section - Premium Overhaul */}
        <section className="relative">
          <motion.div
            variants={REVEAL_ITEM}
            className="max-w-5xl mx-auto rounded bg-slate-900 text-white p-12 md:p-20 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="relative shrink-0">
                <div className="w-48 h-48 rounded border-4 border-primary/30 p-2">
                  <div className="w-full h-full rounded bg-primary flex items-center justify-center text-white shadow-2xl overflow-hidden">
                    {/* Placeholder for dynamic avatar */}
                    <User size={80} className="mb-[-10px]" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded shadow-xl">
                  <CheckCircle size={24} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-5xl font-black tracking-tighter mb-4">
                  Wunna Aung
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                  <span className="px-4 py-1.5 rounded bg-white/10 text-primary font-black text-xs uppercase tracking-[0.2em]">
                    Founder
                  </span>
                  <span className="px-4 py-1.5 rounded bg-white/10 text-white/50 font-black text-xs uppercase tracking-[0.2em]">
                    Product Lead
                  </span>
                </div>
                <p className="text-xl font-medium opacity-80 leading-relaxed mb-8 italic">
                  "Certify isn't just about making documents. It's about
                  preserving the dignity of achievement. Every student and
                  professional deserves a verification layer that is as strong
                  as their willpower."
                </p>
                <div className="h-px w-20 bg-primary/50 mb-8 mx-auto md:mx-0" />
                <p className="font-bold uppercase tracking-widest text-primary text-sm">
                  Dreamed in Myanmar, Built for the World.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </motion.main>
      <Footer />
    </div>
  );
};
