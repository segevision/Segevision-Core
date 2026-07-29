'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe media query hook. Defaults to `false` on the server and during the
 * first client render to avoid hydration mismatches; updates after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // matchMedia is missing in jsdom and in some older embedded webviews. Treating
    // that as "no match" keeps a media-query-driven component rendering its base
    // state instead of throwing during mount.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);
    listener();
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** Convenience hooks built on the Design System v1 breakpoint tokens. */
export const useIsTablet = () => useMediaQuery('(min-width: 640px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsWide = () => useMediaQuery('(min-width: 1440px)');
