/**
 * Layer 1 — Primitive tokens.
 * Raw values only. Never imported directly by components — see semantic.ts.
 * Mirrors Segevision Design System v1, Part 7.
 */

export const spaceScale = {
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
} as const;

export const fontSizeScale = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
} as const;

export const lineHeightScale = {
  tight: '1.1',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.7',
} as const;

export const fontWeightScale = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const radiusScale = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '20px',
  xl: '28px',
  full: '9999px',
} as const;

export const breakpoints = {
  mobile: '0px',
  tablet: '640px',
  desktop: '1024px',
  wide: '1440px',
} as const;

export const durationScale = {
  instant: '100ms',
  fast: '200ms',
  base: '300ms',
  slow: '450ms',
  deliberate: '650ms',
} as const;

export const easingScale = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  springSoft: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  linear: 'linear',
} as const;

export const iconSizeScale = {
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
} as const;
