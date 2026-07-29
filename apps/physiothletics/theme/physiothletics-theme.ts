import { buildClientThemeCss, type ThemeDefinition } from '@segevision/tokens';

export const PHYSIOTHLETICS_THEME_NAME = 'physiothletics';

/**
 * Client brand theme — derived from the approved Medical preset, then moved away
 * from it on three deliberate axes:
 *
 * 1. Hue. The Medical preset's 199° sky blue is the single most over-used colour in
 *    clinic web design. We shift to a deep 188° petrol teal: still reads as clinical
 *    and trustworthy, but at 22% lightness it behaves like an ink, not a highlight,
 *    which is what lets the palette feel premium rather than institutional.
 * 2. Accent. Medical pairs blue with a safety orange. We use a volt lime instead —
 *    the colour language of sports-performance brands. It never carries body text;
 *    it is reserved for rules, icons on ink, and state indicators, so the energy is
 *    present without costing contrast.
 * 3. Neutrals. Every grey is warmed (40° hue base) rather than blue-shifted. Cold
 *    greys are what make a clinic site feel like a waiting room; warm ones carry the
 *    "human" half of the brief without adding a decorative colour.
 *
 * Radius stays at md (12px) — enough to feel contemporary, far enough from the
 * pill-shaped cards that read as consumer-app rather than specialist practice.
 */
export const physiothleticsTheme: ThemeDefinition = {
  label: 'Physiothletics',
  description: 'Petrol-ink clinical credibility with a volt sports-performance accent and warm neutrals.',
  fontDisplay: "'Heebo', system-ui, sans-serif",
  fontBody: "'Assistant', system-ui, sans-serif",
  radiusDefault: 'md',
  colors: {
    light: {
      brandPrimary: '188 68% 22%',
      brandSecondary: '196 45% 13%',
      accent: '74 68% 45%',
      // Not pure white: a warm 99% ground stops large sections reading as empty voids.
      surface: '40 25% 99%',
      surfaceAlt: '40 16% 96%',
      surfaceInverse: '196 45% 9%',
      textPrimary: '196 32% 12%',
      textSecondary: '196 11% 38%',
      textInverse: '40 25% 98%',
      borderDefault: '40 12% 88%',
      borderFocus: '188 68% 34%',
      actionDefault: '188 68% 22%',
      actionHover: '188 68% 17%',
      actionActive: '188 70% 13%',
      actionDisabled: '40 8% 82%',
    },
    dark: {
      brandPrimary: '184 60% 52%',
      brandSecondary: '40 20% 92%',
      accent: '74 70% 55%',
      surface: '196 40% 8%',
      surfaceAlt: '196 32% 12%',
      // Stays dark on purpose: the ink bands (hero, process, footer) must remain the
      // heaviest surface in dark mode too, otherwise the page composition inverts.
      surfaceInverse: '196 50% 5%',
      textPrimary: '40 20% 95%',
      textSecondary: '196 10% 68%',
      textInverse: '40 25% 98%',
      borderDefault: '196 20% 20%',
      borderFocus: '184 60% 58%',
      actionDefault: '184 60% 52%',
      actionHover: '184 60% 60%',
      actionActive: '184 60% 66%',
      actionDisabled: '196 12% 26%',
    },
  },
};

/**
 * Emitted into the document head at render time rather than committed as a CSS file,
 * so the palette above is the single source of truth and cannot drift from what ships.
 */
export const physiothleticsThemeCss = buildClientThemeCss(
  PHYSIOTHLETICS_THEME_NAME,
  physiothleticsTheme,
);
