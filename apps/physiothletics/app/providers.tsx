'use client';

import * as React from 'react';
import { RTLProvider, ThemeProvider } from '@segevision/ui';
import { PHYSIOTHLETICS_THEME_NAME } from '../theme/physiothletics-theme';

/**
 * The client site ships one theme in one mode — there is no theme switcher here,
 * unlike the Core demo. The providers are still used so every shared component
 * resolves direction and theme through the same contract it does everywhere else.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme={PHYSIOTHLETICS_THEME_NAME} defaultMode="light">
      <RTLProvider defaultDirection="rtl">{children}</RTLProvider>
    </ThemeProvider>
  );
}
