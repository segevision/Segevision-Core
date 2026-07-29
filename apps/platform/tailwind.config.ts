import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tailwindPreset } = require('@segevision/config');

/**
 * The platform compiles two visual worlds from one stylesheet:
 *
 *  - the shared preset supplies the token-driven classes (`bg-surface`, `text-action`…)
 *    that @segevision/ui and @segevision/renderer emit inside the preview iframe;
 *  - the `studio-*` scale below is the platform's own chrome, deliberately kept on
 *    separate names so an admin panel can never be restyled by a client's brand theme.
 */
const config: Config = {
  presets: [tailwindPreset],
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/renderer/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          /* four planes of depth, deepest first */
          canvas: 'hsl(var(--studio-canvas) / <alpha-value>)',
          bg: 'hsl(var(--studio-canvas) / <alpha-value>)',
          panel: 'hsl(var(--studio-panel) / <alpha-value>)',
          raised: 'hsl(var(--studio-raised) / <alpha-value>)',
          sunken: 'hsl(var(--studio-sunken) / <alpha-value>)',
          line: 'hsl(var(--studio-line) / <alpha-value>)',
          'line-strong': 'hsl(var(--studio-line-strong) / <alpha-value>)',
          ink: 'hsl(var(--studio-ink) / <alpha-value>)',
          soft: 'hsl(var(--studio-soft) / <alpha-value>)',
          muted: 'hsl(var(--studio-muted) / <alpha-value>)',
          faint: 'hsl(var(--studio-faint) / <alpha-value>)',
          accent: 'hsl(var(--studio-accent) / <alpha-value>)',
          'accent-ink': 'hsl(var(--studio-accent-ink) / <alpha-value>)',
          'accent-soft': 'hsl(var(--studio-accent-soft) / <alpha-value>)',
          ok: 'hsl(var(--studio-ok) / <alpha-value>)',
          warn: 'hsl(var(--studio-warn) / <alpha-value>)',
          danger: 'hsl(var(--studio-danger) / <alpha-value>)',
        },
      },
      /* Type scale with roles — the previous build used 14/15 for everything. */
      fontSize: {
        'ui-label': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        'ui-xs': ['0.75rem', { lineHeight: '1.45' }],
        'ui-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'ui-base': ['0.9375rem', { lineHeight: '1.55' }],
        'ui-lg': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        'ui-xl': ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'ui-2xl': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        'ui-3xl': ['2.25rem', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
      },
      transitionTimingFunction: { studio: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      boxShadow: {
        'studio-sm': '0 1px 2px 0 hsl(220 20% 4% / 0.06)',
        'studio-md': '0 4px 12px -2px hsl(220 20% 4% / 0.10), 0 2px 4px -2px hsl(220 20% 4% / 0.06)',
        'studio-lg': '0 12px 32px -8px hsl(220 20% 4% / 0.18), 0 4px 8px -4px hsl(220 20% 4% / 0.08)',
        'studio-canvas': '0 18px 50px -18px hsl(220 30% 4% / 0.42)',
      },
      fontFamily: {
        studio: ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
        'studio-display': ['Heebo', 'Assistant', 'system-ui', 'sans-serif'],
        'studio-mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
};

export default config;
