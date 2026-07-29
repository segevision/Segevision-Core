import type { Transition, Variants } from 'framer-motion';

/**
 * Motion presets implementing Segevision Design System v1, Part 5 (Motion System).
 * Timing/easing values are the CSS-token equivalents expressed in JS seconds for
 * framer-motion. Every preset accepts a `reduced` flag — when true, transitions
 * collapse to instant, no-transform equivalents (Part 6 accessibility requirement).
 */

const timing = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
  deliberate: 0.65,
};

const easing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  springSoft: [0.34, 1.56, 0.64, 1] as const,
};

export function fadeUp(reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : timing.slow, ease: easing.out },
    },
  };
}

export function staggerContainer(reduced = false, staggerMs = 80): Variants {
  return {
    hidden: {},
    visible: {
      transition: reduced ? {} : { staggerChildren: staggerMs / 1000 },
    },
  };
}

export function scaleHover(reduced = false) {
  return {
    whileHover: reduced ? {} : { scale: 1.02 },
    whileTap: reduced ? {} : { scale: 0.98 },
    transition: { duration: timing.fast, ease: easing.out } as Transition,
  };
}

export function countUpTransition(reduced = false): Transition {
  return { duration: reduced ? 0 : 1.5, ease: 'easeOut' };
}

export function pageCrossFade(reduced = false): Variants {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: reduced ? 0 : timing.base } },
    exit: { opacity: 0, transition: { duration: reduced ? 0 : timing.fast } },
  };
}

export const motionTiming = timing;
export const motionEasing = easing;
