import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import type { FooterProps } from './Footer.types';
import { QUICK_SPRING, REVEAL_ITEM, STAGGER_CONTAINER, VIEWPORT_ONCE } from '@/utils/motion';

export const Footer: React.FC<FooterProps> = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();

  if (minimal) {
    return (
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        className="border-t border-base-200 bg-base-100 py-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:px-6">
          <p className="text-sm font-medium text-base-content/40">
            Copyright {currentYear} Certify Inc. All rights reserved.
          </p>
        </div>
      </motion.footer>
    );
  }

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={STAGGER_CONTAINER}
      className="border-t border-base-200 bg-base-200/50 pb-10 pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={REVEAL_ITEM} className="col-span-1 lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -6, y: -2, transition: QUICK_SPRING }}
                className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
              >
                <Award size={20} className="text-primary-content" />
              </motion.div>
              <span className="text-2xl font-black tracking-tighter text-base-content">Certify</span>
            </div>
            <p className="mb-6 font-medium leading-relaxed text-base-content/50">
              Empowering organizations to recognize achievements with beautiful, secure, and
              professional digital certificates.
            </p>
          </motion.div>

          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-base-content/40">
              Product
            </h4>
            <ul className="space-y-4">
              <li>
                <a className="font-medium text-base-content/60 transition-colors hover:text-primary" href="#features">
                  Features
                </a>
              </li>
              <li>
                <Link
                  to={ROUTES.TEMPLATES}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.INTEGRATIONS}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-base-content/40">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.BATCH_GENERATE}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Batch Workflows
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.SETTINGS}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Workspace Settings
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-base-content/40">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to={ROUTES.CREATE_CERTIFICATE}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Create Certificate
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CERTIFICATES}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Certificate Library
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  Back to Home
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={REVEAL_ITEM}
          className="flex flex-col items-center justify-between gap-6 border-t border-base-200 pt-8 md:flex-row"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-base-content/30">
            Copyright {currentYear} Certify Platforms. Developed by Wunna Aung
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs font-medium text-base-content/40">Built for Excellence.</p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};
