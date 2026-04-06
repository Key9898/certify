import type { Transition, Variants } from 'framer-motion';

export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const SOFT_SPRING: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 0.9,
};

export const QUICK_SPRING: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.8,
};

export const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: MOTION_EASE,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.995,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const REVEAL_ITEM: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: MOTION_EASE,
    },
  },
};

export const VIEWPORT_ONCE = {
  once: true,
  margin: '-72px',
} as const;

export const HOVER_LIFT = {
  y: -6,
  scale: 1.01,
  transition: SOFT_SPRING,
} as const;

export const TAP_PRESS = {
  scale: 0.985,
  transition: QUICK_SPRING,
} as const;
