/**
 * Shared Tailwind preset — the Layer 3 bridge between @segevision/tokens CSS variables
 * and utility classes. Every app/package extends THIS preset; none define their own
 * colors, radii, or shadow scale. Mirrors Segevision Design System v1, Part 7.
 */
const hsl = (variable) => `hsl(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        'brand-primary': hsl('--color-brand-primary'),
        'brand-secondary': hsl('--color-brand-secondary'),
        accent: hsl('--color-accent'),
        surface: hsl('--color-surface'),
        'surface-alt': hsl('--color-surface-alt'),
        'surface-inverse': hsl('--color-surface-inverse'),
        'text-primary': hsl('--color-text-primary'),
        'text-secondary': hsl('--color-text-secondary'),
        'text-inverse': hsl('--color-text-inverse'),
        border: hsl('--color-border-default'),
        'border-focus': hsl('--color-border-focus'),
        action: hsl('--color-action-default'),
        'action-hover': hsl('--color-action-hover'),
        'action-active': hsl('--color-action-active'),
        'action-disabled': hsl('--color-action-disabled'),
        success: hsl('--color-success'),
        warning: hsl('--color-warning'),
        danger: hsl('--color-danger'),
        info: hsl('--color-info'),
      },
      // Full 0-100 opacity scale. JIT only emits the classes actually used, so an
      // exhaustive scale costs nothing and removes the /55, /65, /12 footguns that
      // otherwise silently drop to no class at all.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, index) => [index, String(index / 100)]),
      ),
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
        '6xl': 'var(--font-size-6xl)',
        '7xl': 'var(--font-size-7xl)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        0.5: 'var(--space-0_5)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
        32: 'var(--space-32)',
        40: 'var(--space-40)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        deliberate: 'var(--duration-deliberate)',
      },
      transitionTimingFunction: {
        out: 'var(--easing-out)',
        'in-out': 'var(--easing-inOut)',
        spring: 'var(--easing-springSoft)',
      },
      boxShadow: {
        e1: '0 1px 2px 0 hsl(0 0% 0% / 0.04), 0 1px 3px 0 hsl(0 0% 0% / 0.06)',
        e2: '0 2px 4px -1px hsl(0 0% 0% / 0.06), 0 4px 8px -2px hsl(0 0% 0% / 0.08)',
        e3: '0 4px 8px -2px hsl(0 0% 0% / 0.08), 0 8px 20px -4px hsl(0 0% 0% / 0.1)',
        e4: '0 8px 16px -4px hsl(var(--color-brand-primary) / 0.12), 0 16px 32px -8px hsl(0 0% 0% / 0.14)',
      },
      // Literal values, not var(--breakpoint-*): CSS custom properties are not valid
      // inside an @media query's condition, so a var() here silently disables every
      // responsive variant. Kept in sync with the breakpoints scale in
      // @segevision/tokens (primitives.ts), which still drives the --breakpoint-* vars
      // for any runtime code that needs to read them.
      screens: {
        tablet: '640px',
        desktop: '1024px',
        wide: '1440px',
      },
    },
  },
  plugins: [],
};
