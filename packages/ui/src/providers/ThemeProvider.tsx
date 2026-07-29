'use client';

import * as React from 'react';
import type { BrandThemeName } from '@segevision/tokens';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: BrandThemeName;
  mode: ThemeMode;
  setTheme: (theme: BrandThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Brand theme preset (e.g. 'medical') or a client-specific theme name registered via
   * @segevision/tokens' buildClientThemeCss. Defaults to 'medical'.
   */
  defaultTheme?: BrandThemeName;
  defaultMode?: ThemeMode;
  /** Render an element instead of mutating <html> — useful inside Storybook/tests. */
  asChild?: boolean;
}

/**
 * Sets `data-theme` (brand preset) and toggles the `.dark` class, which is all
 * @segevision/tokens' generated CSS and the shared Tailwind preset need to
 * re-resolve every color token. No component ever re-renders because of a
 * theme change — only CSS variables change. See Design System v1, Part 7.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'medical',
  defaultMode = 'light',
  asChild = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<BrandThemeName>(defaultTheme);
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode);

  React.useEffect(() => {
    if (asChild) return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [theme, mode, asChild]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setTheme,
      setMode,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [theme, mode],
  );

  if (asChild) {
    return (
      <ThemeContext.Provider value={value}>
        <div data-theme={theme} className={mode === 'dark' ? 'dark' : undefined}>
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
