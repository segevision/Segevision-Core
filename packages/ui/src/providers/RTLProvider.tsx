'use client';

import * as React from 'react';
import { DirectionContext, type Direction } from '@segevision/hooks';

export interface RTLProviderProps {
  children: React.ReactNode;
  defaultDirection?: Direction;
  /** Render a wrapping <div dir="..."> instead of mutating <html> — for Storybook/tests. */
  asChild?: boolean;
}

/**
 * Design System v1, Part 6: RTL support is a `dir` attribute switch, never a
 * parallel component build, because every component uses CSS logical properties
 * (`ps-*`/`pe-*`, `text-start`/`text-end`) instead of left/right utilities.
 */
export function RTLProvider({
  children,
  defaultDirection = 'rtl',
  asChild = false,
}: RTLProviderProps) {
  const [direction, setDirection] = React.useState<Direction>(defaultDirection);

  React.useEffect(() => {
    if (asChild) return;
    document.documentElement.setAttribute('dir', direction);
  }, [direction, asChild]);

  const value = React.useMemo(() => ({ direction, setDirection }), [direction]);

  if (asChild) {
    return (
      <DirectionContext.Provider value={value}>
        <div dir={direction}>{children}</div>
      </DirectionContext.Provider>
    );
  }

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}
