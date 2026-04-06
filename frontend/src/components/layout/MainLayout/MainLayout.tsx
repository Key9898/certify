import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DashboardHeader } from '../DashboardHeader/DashboardHeader';
import { Sidebar } from '../Sidebar';
import type { MainLayoutProps } from './MainLayout.types';
import { MOTION_EASE } from '@/utils/motion';

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-base-100 selection:bg-primary/10">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="relative min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] lg:ml-64">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: MOTION_EASE }}
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left bg-gradient-to-r from-primary/0 via-primary/60 to-accent/0"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { x: [0, 16, 0], y: [0, -18, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
          className="pointer-events-none absolute -right-20 top-12 h-72 w-72 rounded-full bg-primary/8 blur-3xl"
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : { x: [0, -12, 0], y: [0, 14, 0] }}
          transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity }}
          className="pointer-events-none absolute bottom-0 left-[-6rem] h-64 w-64 rounded-full bg-accent/8 blur-3xl"
        />

        <div className="relative flex min-h-screen flex-col">
          <DashboardHeader onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

          <motion.main layout className="flex-1 overflow-y-auto p-6 md:p-8">
            <motion.div layout className="mx-auto w-full max-w-7xl">
              {children}
            </motion.div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};
