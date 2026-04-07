import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '../DashboardHeader/DashboardHeader';
import { Sidebar } from '../Sidebar';
import type { MainLayoutProps } from './MainLayout.types';

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100 selection:bg-primary/10">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="relative min-w-0 min-h-screen lg:ml-64 transition-all duration-300">
        <div className="relative flex min-h-screen flex-col">
          <DashboardHeader onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 p-6 md:p-8"
          >
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};
