'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Design System v1, Part 6 (Accessibility): motion is optional, never required,
 * for comprehension. Every animated component must consult this hook and fall
 * back to an instant, static equivalent when it returns true.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
