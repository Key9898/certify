import React from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

const FAQ_ITEMS = [
  {
    category: 'General',
    icon: Sparkles,
    items: [
      {
        question: 'Is Certify truly free?',
        answer:
          'Yes! Currently, our platform allows you to create and verify an unlimited number of certificates at no cost. This is part of our commitment to professional growth for all.',
      },
      {
        question: 'How long does verification take?',
        answer:
          'Every verification query is instant. Our centralized registry ensures that as soon as you hit search, the result is computed in less than 500ms.',
      },
    ],
  },
  {
    category: 'Security & Trust',
    icon: ShieldCheck,
    items: [
      {
        question: 'Are certificates tamper-proof?',
        answer:
          'Absolutely. We use digital signing and immutable record-keeping ensures that any modification to a certificate after issuance will invalidate its security hash.',
      },
      {
        question: 'What happens if I lose my certificate link?',
        answer:
          'Certificates are permanently stored. You can always retrieve them via your dashboard or by using the unique Certificate ID printed on the document.',
      },
    ],
  },
  {
    category: 'Design & Customization',
    icon: Award,
    items: [
      {
        question: 'Can I use my own fonts and logos?',
        answer:
          'Our premium Template Builder supports custom logo uploads, primary/secondary branding colors, and dynamic font selection to match your brand book.',
      },
      {
        question: 'What export formats are supported?',
        answer:
          'Certify supports high-resolution PDF for professional printing and high-fidelity PNG images optimized for LinkedIn and social media sharing.',
      },
    ],
  },
];

export const FAQ: React.FC = () => {
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
        {/* Modern Support Hero */}
        <section className="text-center mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -z-10" />

          <motion.div
            variants={REVEAL_ITEM}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.2em] mb-8"
          >
            <HelpCircle size={14} />
            <span>Support Center Library</span>
          </motion.div>

          <motion.h1
            variants={REVEAL_ITEM}
            className="text-6xl md:text-8xl font-black text-base-content leading-[0.9] tracking-tighter mb-10"
          >
            How can we <br className="hidden md:block" /> help you?
          </motion.h1>

          <motion.p
            variants={REVEAL_ITEM}
            className="text-xl md:text-2xl font-medium text-base-content/60 leading-relaxed max-w-3xl mx-auto"
          >
            Find answers to common questions about designing, creating, and
            verifying digital credentials on the Certify platform.
          </motion.p>
        </section>

        {/* Categorized FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-24 mb-40">
          {FAQ_ITEMS.map((category, catIdx) => (
            <motion.section key={catIdx} variants={REVEAL_ITEM}>
              <div className="flex items-center gap-4 mb-12 border-b border-base-200 pb-8">
                <div className="p-4 rounded bg-base-200 text-primary">
                  <category.icon size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-base-content">
                    {category.category}
                  </h2>
                  <p className="text-sm font-bold text-base-content/40 uppercase tracking-widest">
                    {category.items.length} Articles
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="collapse collapse-plus bg-base-200/40 border border-base-200/60 rounded hover:bg-base-200/80 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="peer"
                      aria-label={`Toggle ${item.question}`}
                    />
                    <div className="collapse-title text-xl font-bold p-8 peer-checked:text-primary transition-colors pr-16 leading-tight">
                      {item.question}
                    </div>
                    <div className="collapse-content px-8 pb-10">
                      <p className="font-medium text-lg text-base-content/60 max-w-3xl leading-relaxed pt-2">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Support CTA Upgrade */}
        <motion.section
          variants={REVEAL_ITEM}
          className="relative max-w-4xl mx-auto p-12 md:p-16 rounded bg-slate-900 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden shadow-3xl"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />

          <div className="relative text-center md:text-left flex-1">
            <div className="inline-flex p-4 rounded bg-white/10 mb-8 border border-white/10">
              <MessageCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">
              Still seeking answers?
            </h2>
            <p className="text-xl font-medium opacity-70 mb-0">
              Our dedicated support lead is available 24/7 to solve your
              technical or branding hurdles.
            </p>
          </div>

          <div className="relative flex flex-col gap-4 w-full md:w-auto">
            <a
              href="mailto:support@certify.ink"
              className="btn btn-primary btn-lg rounded text-lg px-10 font-black h-16 shadow-xl shadow-primary/20"
            >
              <Mail size={20} />
              Contact Support
            </a>
            <p className="text-center text-xs font-black uppercase tracking-widest opacity-40">
              Response time: ~2 hours
            </p>
          </div>
        </motion.section>
      </motion.main>
      <Footer />
    </div>
  );
};
