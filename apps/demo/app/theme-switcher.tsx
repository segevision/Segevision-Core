'use client';

import * as React from 'react';
import { useTheme } from '@segevision/ui';
import { useDirection } from '@segevision/hooks';
import { themeNames } from '@segevision/core';
import type { ThemeName } from '@segevision/tokens';

/**
 * Lives outside @segevision/ui on purpose — this is demo-app chrome, not a
 * reusable design-system component. Proves theme/mode/direction switching
 * end-to-end using only public @segevision/* APIs.
 */
export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const { direction, setDirection } = useDirection();

  return (
    <div
      className="sticky top-0 z-50 flex flex-wrap items-center gap-4 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-md"
      data-testid="theme-switcher"
    >
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        Theme
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeName)}
          className="rounded-md border border-border bg-surface px-2 py-1 text-text-primary"
          data-testid="theme-select"
        >
          {themeNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={toggleMode}
        className="rounded-md border border-border px-3 py-1 text-sm text-text-primary hover:bg-surface-alt"
        data-testid="mode-toggle"
      >
        Mode: {mode}
      </button>

      <button
        onClick={() => setDirection(direction === 'rtl' ? 'ltr' : 'rtl')}
        className="rounded-md border border-border px-3 py-1 text-sm text-text-primary hover:bg-surface-alt"
        data-testid="direction-toggle"
      >
        Direction: {direction.toUpperCase()}
      </button>
    </div>
  );
}
