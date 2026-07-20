import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import type { FooterProps } from './Footer.types';
import { IS_PHASE2 } from '@/config/features';
import {
  QUICK_SPRING,
  REVEAL_ITEM,
  STAGGER_CONTAINER,
  VIEWPORT_ONCE,
} from '@/utils/motion';

const FOOTER_LINK_CLASS =
  'text-sm font-bold uppercase tracking-wide text-slate-600 transition-colors hover:text-primary';

export const Footer: React.FC<FooterProps> = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="relative z-10 border-t border-slate-200 bg-white py-8 text-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:px-6">
          <p className="text-sm font-medium text-slate-500">
            © {currentYear} Qubit Certify Platforms. Developed by Wunna Aung.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white pb-10 pt-20 text-slate-900">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={STAGGER_CONTAINER}
        className="mx-auto w-full max-w-7xl px-4 md:px-6"
      >
        <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            variants={REVEAL_ITEM}
            className="col-span-1 lg:col-span-1"
          >
            <div className="mb-8 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -6, y: -2, transition: QUICK_SPRING }}
                className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
              >
                <img
                  src="/Logo/logo.svg"
                  alt="Qubit Certify"
                  className="h-5 w-5 brightness-0 invert"
                />
              </motion.div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                Qubit Certify
              </span>
            </div>
            <p className="mb-8 pr-4 font-medium leading-relaxed text-slate-600">
              Empowering organizations to recognize achievements with beautiful,
              secure, and professional digital certificates.
            </p>
          </motion.div>

          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-primary">
              Product
            </h4>
            <ul className="space-y-4">
              {IS_PHASE2 && (
                <li>
                  <a className={FOOTER_LINK_CLASS} href="/#features">
                    Features
                  </a>
                </li>
              )}
              <li>
                <Link
                  to={ROUTES.VERIFY_PORTAL}
                  className={FOOTER_LINK_CLASS}
                >
                  Verification Portal
                </Link>
              </li>
              {IS_PHASE2 && (
                <li>
                  <Link to={ROUTES.TEMPLATES} className={FOOTER_LINK_CLASS}>
                    Browse Templates
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>

          {/* LegalCategory */}
          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-primary">
              Company & Legal
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to={ROUTES.ABOUT} className={FOOTER_LINK_CLASS}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY} className={FOOTER_LINK_CLASS}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS} className={FOOTER_LINK_CLASS}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* SupportCategory */}
          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-primary">
              Resources & Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to={ROUTES.FAQ} className={FOOTER_LINK_CLASS}>
                  FAQs
                </Link>
              </li>
              {IS_PHASE2 && (
                <li>
                  <Link to={ROUTES.DASHBOARD} className={FOOTER_LINK_CLASS}>
                    User Dashboard
                  </Link>
                </li>
              )}
              <li>
                <a
                  href="mailto:support@certify.ink"
                  className={FOOTER_LINK_CLASS}
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={REVEAL_ITEM}
          className="flex flex-col items-center justify-between gap-8 border-t border-slate-200 pt-10 md:flex-row"
        >
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              © {currentYear} Qubit Certify Platforms. Developed by Wunna Aung.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Handcrafted for Excellence.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};
