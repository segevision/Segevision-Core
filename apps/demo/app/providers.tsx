'use client';

import * as React from 'react';
import { ThemeProvider, RTLProvider } from '@segevision/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="medical" defaultMode="light">
      <RTLProvider defaultDirection="rtl">{children}</RTLProvider>
    </ThemeProvider>
  );
}
