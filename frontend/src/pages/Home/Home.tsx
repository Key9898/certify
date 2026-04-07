import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowRight, Award, CheckCircle, FileText, Zap } from 'lucide-react';
import { AuthPromptModal } from '@/components/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ROUTES } from '@/utils/constants';
import {
  QUICK_SPRING,
  REVEAL_ITEM,
  SOFT_SPRING,
  STAGGER_CONTAINER,
  TAP_PRESS,
  VIEWPORT_ONCE,
} from '@/utils/motion';
import { VerifySearchWidget } from '@/components/common/VerifySearchWidget/VerifySearchWidget';
import { ScrollToTop } from '@/components/common/ScrollToTop/ScrollToTop';

const CERTIFICATE_PREVIEWS = [
  {
    id: 'corporate',
    title: 'Professional Growth',
    name: 'Elena Rodriguez',
    theme: 'corporate' as const,
    featured: false,
  },
  {
    id: 'modern',
    title: 'Architect of Year',
    name: 'Alexander Wright',
    theme: 'modern' as const,
    featured: true,
  },
  {
    id: 'elegant',
    title: 'Academic Honor',
    name: 'Thomas Chen',
    theme: 'elegant' as const,
    featured: false,
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Pick a Theme',
    desc: 'Choose from curated templates built for professional programs and events.',
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    step: '02',
    title: 'Add Data',
    desc: 'Populate names, dates, issuers, and variables manually or at scale.',
    icon: Zap,
    color: 'text-warning',
    bg: 'bg-warning/15',
  },
  {
    step: '03',
    title: 'Connect Workflows',
    desc: 'Trigger issuance from integrations like Zapier, Sheets, Moodle, or Canvas.',
    icon: CheckCircle,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    step: '04',
    title: 'Export and Verify',
    desc: 'Deliver polished PDFs, public verification pages, and reusable records.',
    icon: Award,
    color: 'text-success',
    bg: 'bg-success/10',
  },
] as const;

const TEAM_FEATURES = [
  {
    title: 'Dynamic Variables',
    desc: 'Batch generate certificates with unique details.',
  },
  {
    title: 'Custom Branding',
    desc: 'Use your color palette, logos, and signatures.',
  },
  {
    title: 'Integration Hub',
    desc: 'Connect no-code tools, LMS platforms, and spreadsheets.',
  },
  {
    title: 'Verification Layer',
    desc: 'Share secure public verification links with every certificate.',
  },
] as const;

const SOCIAL_PROOF_AVATARS = [
  '1535713875002-d1d0cf377fde',
  '1494790108377-be9c29b29330',
  '1599566150163-29194dcaad36',
  '1534528741775-53994a69daeb',
] as const;

const HERO_METRICS = [
  {
    label: 'Template Library',
    value: '12+',
    detail: 'curated certificate looks',
  },
  {
    label: 'Automation Ready',
    value: 'Sheets + Canvas',
    detail: 'native-first launch paths',
  },
  {
    label: 'Verification Layer',
    value: 'PDF + Public Link',
    detail: 'shareable proof by default',
  },
] as const;

const CertificatePreview: React.FC<{
  title: string;
  name: string;
  theme: 'modern' | 'elegant' | 'corporate';
  mode?: 'featured' | 'preview';
}> = ({ title, name, theme, mode = 'featured' }) => {
  const isFeatured = mode === 'featured';

  const getThemeStyles = () => {
    switch (theme) {
      case 'modern':
        return 'bg-white border-blue-100 shadow-[inset_0_0_40px_rgba(59,130,246,0.03)]';
      case 'elegant':
        return 'bg-white border-amber-100 shadow-[inset_0_0_40px_rgba(217,119,6,0.03)]';
      case 'corporate':
        return 'bg-white border-slate-100 shadow-[inset_0_0_40px_rgba(30,41,59,0.03)]';
      default:
        return 'bg-white border-base-200';
    }
  };

  const getPrimaryColor = () => {
    switch (theme) {
      case 'modern':
        return 'text-primary';
      case 'elegant':
        return 'text-amber-600';
      case 'corporate':
        return 'text-slate-800';
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.div
      animate={{
        scale: isFeatured ? 1 : 0.97,
        opacity: isFeatured ? 1 : 0.92,
      }}
      transition={SOFT_SPRING}
      className={`relative flex h-full w-full flex-col items-center overflow-hidden rounded border-[10px] p-4 text-center select-none sm:p-7 md:border-[18px] md:p-8 ${getThemeStyles()}`}
    >
      <motion.div
        className={`pointer-events-none absolute inset-2 rounded border-2 border-current opacity-[0.15] md:inset-4 ${getPrimaryColor()}`}
        animate={{ scale: isFeatured ? 1 : 0.985, opacity: isFeatured ? 0.15 : 0.11 }}
        transition={SOFT_SPRING}
      />

      <motion.div
        animate={{
          opacity: isFeatured ? 1 : 0.72,
          scale: isFeatured ? 1 : 0.95,
          y: isFeatured ? 0 : 4,
        }}
        transition={SOFT_SPRING}
        className="relative z-10 mb-2 md:mb-6"
      >
        <motion.div
          className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded bg-current/10 md:h-16 md:w-16 ${getPrimaryColor()}`}
          animate={{ rotate: isFeatured ? 0 : -4 }}
          transition={SOFT_SPRING}
        >
          <img src="/Logo/logo.svg" alt="Award" className="h-5 w-5 brightness-0 invert md:h-9 md:w-9" />
        </motion.div>
        <p
          className={`text-[6px] font-black uppercase tracking-[0.4em] opacity-90 md:text-[10px] ${getPrimaryColor()}`}
        >
          Certificate of Excellence
        </p>
      </motion.div>

      <motion.h2
        animate={{
          opacity: 1,
          y: 0,
          scale: isFeatured ? 1 : 0.98,
        }}
        transition={SOFT_SPRING}
        className={`relative z-10 mb-2 w-full px-2 font-black leading-tight tracking-tight ${
          isFeatured
            ? 'line-clamp-2 text-sm text-slate-900 sm:text-2xl md:mb-4 md:text-3xl'
            : 'line-clamp-1 text-xs text-slate-800 sm:text-lg md:text-xl'
        }`}
      >
        {title}
      </motion.h2>

      <motion.div
        className={`relative z-10 mx-auto mb-3 h-0.5 w-12 rounded bg-current/20 md:mb-5 md:h-1 md:w-20 ${getPrimaryColor()}`}
        animate={{ opacity: isFeatured ? 1 : 0.35, scaleX: isFeatured ? 1 : 0.8 }}
        transition={SOFT_SPRING}
      />

      <div className="relative z-10 mb-2 w-full px-4 md:mb-4">
        <motion.p
          animate={{ opacity: isFeatured ? 1 : 0.8 }}
          transition={SOFT_SPRING}
          className="mb-1 text-[6px] font-medium italic text-slate-500 md:text-[10px]"
        >
          Is presented to
        </motion.p>
        <motion.p
          animate={{ opacity: 1, y: 0, scale: isFeatured ? 1 : 0.96 }}
          transition={SOFT_SPRING}
          className={`line-clamp-1 font-serif italic tracking-tight ${
            isFeatured
              ? 'mb-4 text-lg font-black text-slate-900 sm:text-2xl md:text-4xl'
              : 'text-sm font-bold text-slate-800 sm:text-xl md:text-2xl'
          } ${getPrimaryColor()}`}
        >
          {name}
        </motion.p>
      </div>

      <AnimatePresence initial={false}>
        {isFeatured && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SOFT_SPRING}
            className="relative z-10 mb-auto max-w-[200px] overflow-hidden pb-2 text-[7px] leading-tight text-slate-500 md:max-w-md md:text-[11px]"
          >
            In recognition of outstanding dedication and exceptional professional integrity
            within the industry.
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: isFeatured ? 1 : 0.9, y: 0 }}
        transition={SOFT_SPRING}
        className="relative z-10 flex w-full items-end justify-between border-t border-slate-100 pt-4 md:pt-6"
      >
        <div className="w-1/3 text-left">
          <p className="text-[6px] font-bold text-slate-800 md:text-[11px]">Mar 28, 2026</p>
          <p className="mt-1 text-[5px] font-black uppercase tracking-widest text-slate-400 md:text-[8px]">
            Date
          </p>
        </div>
        <div className="flex w-1/3 flex-col items-center">
          <div className={`mb-0.5 text-[8px] font-serif italic opacity-60 md:text-lg ${getPrimaryColor()}`}>
            Certify.ink
          </div>
          <div className="h-px w-8 bg-slate-200 md:w-16" />
          <p className="mt-1 text-[5px] font-black uppercase tracking-widest text-slate-400 md:text-[8px]">
            Signature
          </p>
        </div>
        <div className="w-1/3 text-right">
          <p className="text-[6px] font-bold text-slate-800 md:text-[11px]">Global Academy</p>
          <p className="mt-1 text-[5px] font-black uppercase tracking-widest text-slate-400 md:text-[8px]">
            Issuer
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, isLoading, error: auth0Error } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeAuthAction, setActiveAuthAction] = useState<'signin' | 'signup' | 'google' | null>(
    null
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useLayoutEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }, [location.hash]);

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setActiveAuthAction(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setActiveAuthAction(null);
  };

  useEffect(() => {
    if (!auth0Error) {
      return;
    }

    setAuthError(
      `${auth0Error.message} If you are testing locally, make sure ${window.location.origin} is added to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins in Auth0.`
    );
  }, [auth0Error]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authErrorCode = searchParams.get('error');
    const authErrorDescription = searchParams.get('error_description');

    if (!authErrorCode) {
      return;
    }

    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
    setAuthError(
      authErrorDescription
        ? `${authErrorCode}: ${authErrorDescription}`
        : `Authentication failed with error: ${authErrorCode}`
    );

    // Clear error params from URL so hard reload doesn't re-trigger the modal
    window.history.replaceState({}, '', window.location.pathname);
  }, [location.search]);

  const authenticate = async (
    action: 'signin' | 'signup' | 'google',
    options?: {
      screenHint?: 'signup';
      connection?: string;
    }
  ) => {
    setAuthError(null);
    setActiveAuthAction(action);

    const authOptions = {
      appState: { returnTo: ROUTES.DASHBOARD },
      authorizationParams: {
        ...(options?.screenHint ? { screen_hint: options.screenHint } : {}),
        ...(options?.connection ? { connection: options.connection } : {}),
        prompt: 'login' as const,
      },
    };

    try {
      closeAuthModal();
      await loginWithRedirect(authOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';

      setAuthError(
        `${message} If you are testing locally, make sure ${window.location.origin} is added to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins in Auth0.`
      );
    } finally {
      setActiveAuthAction(null);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    openAuthModal('signup');
  };

  const handleExploreTemplates = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    openAuthModal('signin');
  };

  const cardVariants: Variants = {
    initial: { opacity: 0, scale: 0.82, y: 28 },
    desktop: (index: number) => {
      const isFeatured = CERTIFICATE_PREVIEWS[index].featured;
      const isLeft = index === 0;
      const isRight = index === 2;

      return {
        opacity: 1,
        scale: isFeatured ? 1.12 : 0.85,
        rotate: isLeft ? -8 : isRight ? 8 : 0,
        x: isLeft ? '-24%' : isRight ? '24%' : '0%',
        y: isFeatured ? -20 : 15,
        zIndex: isFeatured ? 30 : 10,
        transition: { ...SOFT_SPRING, delay: index * 0.08 },
      };
    },
    mobile: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      x: 0,
      y: 0,
      zIndex: 30,
      transition: SOFT_SPRING,
    },
    hover: (index: number) => {
      const isFeatured = CERTIFICATE_PREVIEWS[index].featured;

      return {
        scale: isFeatured ? 1.15 : 1.03,
        rotate: 0,
        y: isFeatured ? -28 : -6,
        zIndex: 100,
        transition: QUICK_SPRING,
      };
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Header onOpenAuthModal={openAuthModal} />

      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-32 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-base-100 to-base-100" />
        <motion.div
          className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]"
          animate={{ x: ['50%', '46%', '50%'], y: ['-33%', '-30%', '-33%'] }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SOFT_SPRING}
          className="z-10 mx-auto max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SOFT_SPRING, delay: 0.15 }}
            className="mb-10 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded bg-primary opacity-55"
                animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                className="relative inline-flex h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 0.92, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            New: Pro Templates v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_SPRING, delay: 0.2 }}
            className="mb-8 text-6xl font-black leading-[1.1] tracking-tight text-base-content md:text-8xl"
          >
            Recognize Every <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Achievement.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_SPRING, delay: 0.28 }}
            className="mx-auto mb-12 max-w-2xl text-xl font-medium leading-relaxed text-base-content/60 md:text-2xl"
          >
            A polished workspace for designing certificates, automating issuance, and
            connecting your training stack without friction.
          </motion.p>

          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <motion.div variants={REVEAL_ITEM}>
              {isAuthenticated ? (
                <motion.div whileHover={{ y: -4 }} whileTap={TAP_PRESS} transition={QUICK_SPRING}>
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="btn btn-primary btn-lg rounded px-12 text-lg font-bold shadow-xl shadow-primary/25"
                  >
                    Go to Dashboard
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  whileHover={isLoading ? undefined : { y: -4 }}
                  whileTap={isLoading ? undefined : TAP_PRESS}
                  transition={QUICK_SPRING}
                  className="btn btn-primary btn-lg rounded px-12 text-lg font-bold shadow-xl shadow-primary/25"
                >
                  {isLoading ? (
                    <motion.span
                      className="loading loading-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
                    />
                  ) : (
                    'Start Free'
                  )}
                </motion.button>
              )}
            </motion.div>

            <motion.div
              variants={REVEAL_ITEM}
              whileHover={{ y: -3, backgroundColor: 'rgba(226,232,240,0.7)' }}
              whileTap={TAP_PRESS}
              transition={QUICK_SPRING}
            >
              <button
                type="button"
                onClick={handleExploreTemplates}
                className="btn btn-ghost btn-lg rounded px-8 text-lg font-bold"
              >
                Explore Templates
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-10 grid max-w-4xl gap-3 text-left sm:grid-cols-3"
          >
            {HERO_METRICS.map((item) => (
              <motion.div
                key={item.label}
                variants={REVEAL_ITEM}
                whileHover={{ y: -4 }}
                transition={QUICK_SPRING}
                className="rounded border border-base-200 bg-base-100/85 px-5 py-4 shadow-sm backdrop-blur"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-base-content/35">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-black tracking-tight text-base-content">
                  {item.value}
                </p>
                <p className="mt-1 text-sm font-medium text-base-content/55">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_SPRING, delay: 0.5 }}
            className="mt-20 flex w-full max-w-4xl flex-col items-center gap-6 rounded bg-base-200/50 p-8 border border-base-200 backdrop-blur-md md:p-12"
          >
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-black tracking-tighter text-base-content md:text-3xl">
                Verify a Digital Achievement
              </h2>
              <p className="mb-8 font-medium text-base-content/50">
                Enter a Certificate ID to validate its authenticity instantly.
              </p>
            </div>
            <VerifySearchWidget variant="large" />
          </motion.div>
        </motion.div>

        <div className="relative mt-20 flex w-full max-w-7xl flex-col items-center px-4">
          <div className="relative flex min-h-[350px] w-full items-center justify-center sm:min-h-[450px] md:min-h-[580px]">
            <AnimatePresence>
              {CERTIFICATE_PREVIEWS.map((cert, index) => {
                const isFeatured = cert.featured;
                const isActiveMobile = index === activeIndex;

                if (isMobile && !isActiveMobile) {
                  return null;
                }

                return (
                  <motion.div
                    key={cert.id}
                    custom={index}
                    variants={cardVariants}
                    initial="initial"
                    animate={isMobile ? 'mobile' : 'desktop'}
                    whileHover="hover"
                    className="absolute aspect-[297/210] w-full max-w-[280px] cursor-pointer sm:max-w-[360px] md:max-w-2xl"
                  >
                    <motion.div
                      className={`h-full w-full overflow-hidden rounded ${
                        isFeatured
                          ? 'shadow-[0_50px_100px_-25px_rgba(0,0,0,0.25)]'
                          : 'shadow-xl'
                      }`}
                      whileHover={{ boxShadow: '0 35px 70px -28px rgba(15,23,42,0.22)' }}
                      transition={QUICK_SPRING}
                    >
                      <CertificatePreview
                        title={cert.title}
                        name={cert.name}
                        theme={cert.theme}
                        mode={isMobile || isFeatured ? 'featured' : 'preview'}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {isMobile && (
            <div className="mt-10 flex justify-center gap-3">
              {CERTIFICATE_PREVIEWS.map((preview, index) => (
                <motion.button
                  key={preview.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="flex h-11 w-11 items-center justify-center rounded"
                  whileHover={{ y: -2 }}
                  whileTap={TAP_PRESS}
                  transition={QUICK_SPRING}
                  aria-label={`Show design ${index + 1}`}
                >
                  <motion.span
                    className={`block rounded ${
                      activeIndex === index ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-base-300'
                    }`}
                    animate={{
                      width: activeIndex === index ? 40 : 10,
                      height: 10,
                    }}
                    transition={QUICK_SPRING}
                  />
                </motion.button>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_SPRING, delay: 0.6 }}
            className={`relative z-50 flex items-center gap-5 rounded border border-base-200 bg-base-100/95 px-12 py-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] ring-1 ring-base-200/5 backdrop-blur-2xl ${
              isMobile ? 'mt-8' : '-mt-12 md:-mt-16'
            }`}
          >
            <div className="flex -space-x-4">
              {SOCIAL_PROOF_AVATARS.map((id, index) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.88, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ ...SOFT_SPRING, delay: 0.7 + index * 0.05 }}
                  className="h-11 w-11 overflow-hidden rounded border-[4px] border-base-100 bg-primary/20 shadow-inner ring-1 ring-black/5"
                >
                  <img
                    src={`https://images.unsplash.com/photo-${id}?w=100&h=100&auto=format&fit=crop&q=80`}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
            <div className="text-left">
              <p className="mb-1 text-lg font-black leading-none tracking-tight text-primary">
                2,500+ <span className="font-medium text-base-content/60">Joined Professionals</span>
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/20 italic">
                Global Industry Standard
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        id="features"
        className="relative overflow-hidden bg-base-100 py-32"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <motion.h2
            variants={REVEAL_ITEM}
            className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-primary"
          >
            Simple Workflow
          </motion.h2>
          <motion.h3
            variants={REVEAL_ITEM}
            className="mb-24 text-5xl font-black tracking-tighter text-base-content md:text-7xl"
          >
            How Certify Powers You
          </motion.h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {WORKFLOW_STEPS.map((item, index) => (
              <motion.div
                key={item.step}
                variants={REVEAL_ITEM}
                whileHover={{ y: -8 }}
                transition={{ ...SOFT_SPRING, delay: index * 0.04 }}
                className="relative rounded border border-base-200 bg-base-100 p-8 shadow-sm"
              >
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  transition={QUICK_SPRING}
                  className={`mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded shadow-inner ${item.bg}`}
                >
                  <item.icon size={36} className={item.color} />
                </motion.div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-base-content/30">
                  Step {item.step}
                </p>
                <h4 className="mb-4 text-3xl font-black tracking-tight text-base-content">
                  {item.title}
                </h4>
                <p className="text-lg font-medium leading-relaxed text-base-content/50">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-base-200/50 py-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT_ONCE}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <motion.div
              variants={STAGGER_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              <motion.h2
                variants={REVEAL_ITEM}
                className="mb-10 text-5xl font-black leading-tight tracking-tighter text-base-content md:text-7xl"
              >
                Modern Tools for <br />
                <span className="text-primary">Global Teams</span>
              </motion.h2>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                {TEAM_FEATURES.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={REVEAL_ITEM}
                    whileHover={{ x: 4 }}
                    transition={QUICK_SPRING}
                    className="flex gap-5"
                  >
                    <div className="mt-1 shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={QUICK_SPRING}
                        className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 shadow-inner"
                      >
                        <CheckCircle size={18} className="text-primary" />
                      </motion.div>
                    </div>
                    <div>
                      <h5 className="mb-2 text-xl font-black tracking-tight text-base-content">
                        {feature.title}
                      </h5>
                      <p className="text-lg font-medium leading-relaxed text-base-content/50">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={SOFT_SPRING}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[120px]" />
              <motion.div
                whileHover={{ rotate: 1.5, y: -6 }}
                transition={SOFT_SPRING}
                className="relative overflow-hidden rounded border border-base-200 bg-white p-4 shadow-2xl"
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                  alt="Feature showcase"
                  className="w-full rounded"
                  whileHover={{ scale: 1.03 }}
                  transition={SOFT_SPRING}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="bg-base-100 py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT_ONCE}
            transition={SOFT_SPRING}
            className="group relative overflow-hidden rounded bg-primary p-20 text-center shadow-2xl md:p-32"
          >
            <motion.div
              className="absolute right-0 top-0 h-[800px] w-[800px] rounded-full bg-white/10 blur-[150px]"
              animate={{ x: ['50%', '46%', '50%'], y: ['-50%', '-46%', '-50%'] }}
              transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
            />
            <h2 className="mb-10 text-6xl font-black leading-[0.9] tracking-tighter text-white md:text-8xl">
              Start Creating <br /> Today
            </h2>
            <p className="mx-auto mb-14 max-w-2xl text-2xl font-medium text-primary-content/80">
              Join thousands of professionals issuing verified digital certificates instantly
              and for free.
            </p>
            <div className="flex justify-center">
              <motion.button
                type="button"
                onClick={handleGetStarted}
                disabled={isLoading}
                whileHover={isLoading ? undefined : { y: -4 }}
                whileTap={isLoading ? undefined : TAP_PRESS}
                transition={QUICK_SPRING}
                className="btn btn-lg h-20 gap-4 rounded border-none bg-white px-16 text-2xl font-black text-primary shadow-2xl hover:bg-white/90"
              >
                {isLoading ? (
                  <motion.span
                    className="loading loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
                  />
                ) : (
                  <>
                    {isAuthenticated ? 'Open Dashboard' : 'Start Free'}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight size={32} />
                    </motion.span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <AuthPromptModal
        isOpen={isAuthModalOpen}
        mode={authModalMode}
        onClose={closeAuthModal}
        onSignIn={() => authenticate('signin')}
        onSignUp={() => authenticate('signup', { screenHint: 'signup' })}
        onGoogleSignIn={() => authenticate('google', { connection: 'google-oauth2' })}
        isLoading={activeAuthAction !== null}
        activeAction={activeAuthAction}
        error={authError}
      />
      <ScrollToTop />
    </div>
  );
};

export default Home;
