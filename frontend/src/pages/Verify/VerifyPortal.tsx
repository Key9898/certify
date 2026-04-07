import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, FileCheck, Lock, Globe, Zap, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VerifySearchWidget } from '@/components/common/VerifySearchWidget/VerifySearchWidget';
import { REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

export const VerifyPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header />
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.main 
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="container mx-auto px-4 md:px-6 relative z-10 py-24 flex-1"
      >
        {/* Core Verification Hero */}
        <section className="text-center mb-32 max-w-5xl mx-auto">
          <motion.div
            variants={REVEAL_ITEM}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.25em] mb-10 shadow-sm border border-primary/5"
          >
            <ShieldCheck size={16} />
            <span>Official Identity Gateway</span>
          </motion.div>

          <motion.h1 
            variants={REVEAL_ITEM}
            className="text-6xl md:text-9xl font-black text-base-content leading-[0.85] tracking-tighter mb-12"
          >
            Verify <br className="hidden md:block" /> Authenticity.
          </motion.h1>

          <motion.p 
            variants={REVEAL_ITEM}
            className="text-xl md:text-3xl font-medium text-base-content/60 mb-20 leading-tight max-w-3xl mx-auto"
          >
            Instantly validate any certificate issued via the Certify platform. 
            Enter the unique ID below to begin the audit.
          </motion.p>

          <motion.div 
            variants={REVEAL_ITEM} 
            className="flex justify-center p-6 rounded bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-base-200"
          >
            <VerifySearchWidget variant="large" />
          </motion.div>
        </section>

        {/* Global Stats / Trust Indicators */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto mb-40">
           {[
             { label: "Verified Claims", value: "Unlimited", icon: CheckCircle },
             { label: "Registry Health", value: "100%", icon: Zap },
             { label: "Global Nodes", value: "Instant", icon: Globe },
             { label: "Security Protocol", value: "SSL+AES", icon: Lock }
           ].map((stat, i) => (
             <motion.div key={i} variants={REVEAL_ITEM} className="text-center">
               <div className="flex justify-center mb-4 text-primary opacity-40">
                 <stat.icon size={24} />
               </div>
               <div className="text-3xl font-black tracking-tighter text-base-content mb-1">{stat.value}</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{stat.label}</div>
             </motion.div>
           ))}
        </section>

        {/* Feature Experience Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-40">
          {[
            {
              icon: Search,
              title: "Blockchain-Ready Registry",
              desc: "Every certificate metadata is optimized for immutable verification.",
              v: "bg-blue-50 text-blue-600"
            },
            {
              icon: Lock,
              title: "Tamper-Proof DNA",
              desc: "Digital signatures detect even the smallest bit modification in the document.",
              v: "bg-amber-50 text-amber-600"
            },
            {
              icon: FileCheck,
              title: "Official Verification Badge",
              desc: "Validated records get a public link and an embeddable badge for LinkedIn.",
              v: "bg-emerald-50 text-emerald-600"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={REVEAL_ITEM}
              whileHover={{ y: -8 }}
              className="p-10 rounded bg-slate-900/50 border border-white/5 backdrop-blur-xl group hover:bg-white transition-all duration-500 shadow-xl"
            >
              <div className={`w-16 h-16 rounded ${feature.v} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-slate-900 mb-4 tracking-tight leading-tight transition-colors">
                {feature.title}
              </h3>
              <p className="font-medium text-white/50 group-hover:text-slate-600 leading-relaxed transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Immersive How-To Section */}
        <motion.section 
          variants={REVEAL_ITEM}
          className="relative max-w-6xl mx-auto p-12 md:p-24 rounded bg-slate-900 text-white overflow-hidden shadow-3xl"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
                <div className="flex-1">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.95]">Locate your <br /> Certificate ID.</h2>
                    <p className="text-xl opacity-60 font-medium mb-12 leading-relaxed">
                        Every credential carries a unique identifier. This ID is your key 
                        to proving authenticity to employers or institutions worldwide.
                    </p>
                    
                    <div className="space-y-6">
                        {[
                            { step: "01", text: "Download your official PDF/PNG from Certify." },
                            { step: "02", text: "Look for the unique ID in the bottom corner." },
                            { step: "03", text: "Paste it here for instant global validation." }
                        ].map((s, i) => (
                            <div key={i} className="flex gap-6 items-center">
                                <div className="text-primary font-black text-2xl">{s.step}</div>
                                <div className="font-bold opacity-90">{s.text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="aspect-[3/4] bg-white/5 rounded border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative z-10">
                            <div className="h-6 w-1/3 bg-white/20 rounded mb-4 animate-pulse" />
                            <div className="h-4 w-2/3 bg-white/10 rounded mb-8 animate-pulse" />
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-white/10 rounded" />
                                <div className="h-2 w-full bg-white/10 rounded" />
                                <div className="h-2 w-2/3 bg-white/10 rounded" />
                            </div>
                        </div>

                        <div className="relative z-10 pt-12">
                            <div className="p-4 rounded bg-primary text-white font-black text-center text-sm shadow-xl shadow-primary/20 mb-4">
                                CERT-98234-A
                            </div>
                            <p className="text-[10px] text-center font-black uppercase tracking-widest text-white/40">Verified Identifier Position</p>
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
