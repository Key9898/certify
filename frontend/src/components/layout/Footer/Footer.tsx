import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
            © {currentYear} Certify Platforms. Developed by Wunna Aung.
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
      className="border-t border-base-200 bg-base-100 pb-10 pt-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={REVEAL_ITEM} className="col-span-1 lg:col-span-1">
            <div className="mb-8 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -6, y: -2, transition: QUICK_SPRING }}
                className="rounded bg-primary p-2 shadow-lg shadow-primary/20"
              >
                <img src="/Logo/logo.svg" alt="Certify" className="h-5 w-5 brightness-0 invert" />
              </motion.div>
              <span className="text-2xl font-black tracking-tighter text-base-content">Certify</span>
            </div>
            <p className="mb-8 font-medium leading-relaxed text-base-content/50 pr-4">
              Empowering organizations to recognize achievements with beautiful, secure, and
              professional digital certificates.
            </p>
          </motion.div>

          {/* ProductCategory */}
          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-primary">
              Product
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide" 
                  href="/#features"
                >
                  Features
                </a>
              </li>
              <li>
                <Link
                  to={ROUTES.VERIFY_PORTAL}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  Verification Portal
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.TEMPLATES}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  Browse Templates
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* LegalCategory */}
          <motion.div variants={REVEAL_ITEM}>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-primary">
              Company & Legal
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to={ROUTES.ABOUT}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PRIVACY}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.TERMS}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
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
                <Link
                  to={ROUTES.FAQ}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  User Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@certify.ink"
                  className="font-bold text-base-content/60 transition-colors hover:text-primary text-sm uppercase tracking-wide"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={REVEAL_ITEM}
          className="flex flex-col items-center justify-between gap-8 border-t border-base-200 pt-10 md:flex-row"
        >
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-base-content/30">
              © {currentYear} Certify Platforms. Developed by Wunna Aung.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-1 w-1 rounded-full bg-base-200" />
            <p className="text-xs font-black uppercase tracking-widest text-base-content/20">
              Handcrafted for Excellence.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};
