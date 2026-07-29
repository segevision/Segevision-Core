/**
 * Layer 2 — Semantic color tokens, grouped by Brand Theme preset.
 * Mirrors Segevision Design System v1, Part 4 (Brand Themes) and Part 7 (Token Architecture).
 *
 * Each theme overrides ONLY color + font-family + radius-default + shadow-tone tokens.
 * No component or layout token is ever redefined per theme — that is what keeps every
 * theme compatible with the exact same @segevision/ui component set.
 *
 * Colors are stored as "H S% L%" triplets (no hsl() wrapper) so Tailwind can consume them
 * as `hsl(var(--color-x) / <alpha-value>)`, which keeps opacity utilities working.
 */

export type ThemeName =
  | 'medical'
  | 'luxury'
  | 'corporate'
  | 'fitness'
  | 'restaurant'
  | 'hotel'
  | 'legal'
  | 'construction'
  | 'technology';

export type ThemeMode = 'light' | 'dark';

/**
 * A client site may register its own brand theme (see buildClientThemeCss) instead of
 * shipping one of the built-in presets. Keeping the literal union in the type preserves
 * autocomplete for the presets while still accepting a client-specific name.
 */
export type BrandThemeName = ThemeName | (string & {});

export interface ThemeColorTokens {
  brandPrimary: string;
  brandSecondary: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  surfaceInverse: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  borderDefault: string;
  borderFocus: string;
  actionDefault: string;
  actionHover: string;
  actionActive: string;
  actionDisabled: string;
}

export interface ThemeDefinition {
  label: string;
  description: string;
  fontDisplay: string;
  fontBody: string;
  radiusDefault: 'sm' | 'md' | 'lg' | 'xl';
  colors: Record<ThemeMode, ThemeColorTokens>;
}

/** Fixed across every theme — never overridden. Design System v1, Part 1 (Color Philosophy). */
export const semanticStatusColors: Record<ThemeMode, Record<'success' | 'warning' | 'danger' | 'info', string>> = {
  light: {
    success: '142 71% 33%',
    warning: '38 92% 42%',
    danger: '0 72% 47%',
    info: '199 89% 42%',
  },
  dark: {
    success: '142 65% 45%',
    warning: '38 92% 55%',
    danger: '0 72% 60%',
    info: '199 89% 60%',
  },
};

export const themes: Record<ThemeName, ThemeDefinition> = {
  medical: {
    label: 'Medical',
    description: 'Clinical trust + sports-performance energy. Reference theme for Physiothletics.',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'md',
    colors: {
      light: {
        brandPrimary: '199 89% 33%',
        brandSecondary: '24 95% 53%',
        accent: '24 95% 53%',
        surface: '0 0% 100%',
        surfaceAlt: '210 20% 98%',
        surfaceInverse: '215 28% 17%',
        textPrimary: '215 28% 17%',
        textSecondary: '215 14% 40%',
        textInverse: '0 0% 100%',
        borderDefault: '214 20% 88%',
        borderFocus: '199 89% 45%',
        actionDefault: '199 89% 33%',
        actionHover: '199 89% 28%',
        actionActive: '199 89% 24%',
        actionDisabled: '214 15% 80%',
      },
      dark: {
        brandPrimary: '199 89% 55%',
        brandSecondary: '24 95% 60%',
        accent: '24 95% 60%',
        surface: '215 28% 12%',
        surfaceAlt: '215 25% 16%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '210 20% 96%',
        textSecondary: '215 14% 70%',
        textInverse: '215 28% 12%',
        borderDefault: '215 20% 24%',
        borderFocus: '199 89% 60%',
        actionDefault: '199 89% 55%',
        actionHover: '199 89% 62%',
        actionActive: '199 89% 68%',
        actionDisabled: '215 15% 30%',
      },
    },
  },
  luxury: {
    label: 'Luxury',
    description: 'Restraint over decoration. Deep charcoal + metallic gold accent.',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'sm',
    colors: {
      light: {
        brandPrimary: '0 0% 12%',
        brandSecondary: '42 60% 50%',
        accent: '42 60% 50%',
        surface: '40 30% 98%',
        surfaceAlt: '40 20% 94%',
        surfaceInverse: '0 0% 8%',
        textPrimary: '0 0% 12%',
        textSecondary: '0 0% 35%',
        textInverse: '40 30% 98%',
        borderDefault: '40 15% 85%',
        borderFocus: '42 60% 45%',
        actionDefault: '0 0% 12%',
        actionHover: '0 0% 20%',
        actionActive: '0 0% 6%',
        actionDisabled: '40 10% 80%',
      },
      dark: {
        brandPrimary: '42 60% 55%',
        brandSecondary: '40 30% 90%',
        accent: '42 60% 55%',
        surface: '0 0% 8%',
        surfaceAlt: '0 0% 12%',
        surfaceInverse: '40 30% 98%',
        textPrimary: '40 30% 95%',
        textSecondary: '40 10% 70%',
        textInverse: '0 0% 8%',
        borderDefault: '0 0% 22%',
        borderFocus: '42 60% 55%',
        actionDefault: '42 60% 55%',
        actionHover: '42 60% 62%',
        actionActive: '42 60% 68%',
        actionDisabled: '0 0% 25%',
      },
    },
  },
  corporate: {
    label: 'Corporate',
    description: 'Highest information density tolerance. Navy + steel gray.',
    fontDisplay: "'IBM Plex Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'sm',
    colors: {
      light: {
        brandPrimary: '221 65% 28%',
        brandSecondary: '215 15% 45%',
        accent: '221 65% 45%',
        surface: '0 0% 100%',
        surfaceAlt: '210 20% 97%',
        surfaceInverse: '221 39% 14%',
        textPrimary: '221 39% 14%',
        textSecondary: '215 14% 40%',
        textInverse: '0 0% 100%',
        borderDefault: '214 20% 88%',
        borderFocus: '221 65% 45%',
        actionDefault: '221 65% 28%',
        actionHover: '221 65% 22%',
        actionActive: '221 65% 18%',
        actionDisabled: '214 15% 80%',
      },
      dark: {
        brandPrimary: '221 65% 55%',
        brandSecondary: '215 15% 65%',
        accent: '221 65% 60%',
        surface: '221 30% 10%',
        surfaceAlt: '221 25% 14%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '210 20% 96%',
        textSecondary: '215 14% 70%',
        textInverse: '221 30% 10%',
        borderDefault: '221 20% 22%',
        borderFocus: '221 65% 60%',
        actionDefault: '221 65% 55%',
        actionHover: '221 65% 62%',
        actionActive: '221 65% 68%',
        actionDisabled: '221 15% 28%',
      },
    },
  },
  fitness: {
    label: 'Fitness',
    description: 'High-energy, dark-mode-first performance aesthetic.',
    fontDisplay: "'Barlow Condensed', sans-serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'xl',
    colors: {
      light: {
        brandPrimary: '16 90% 50%',
        brandSecondary: '0 0% 10%',
        accent: '16 90% 50%',
        surface: '0 0% 100%',
        surfaceAlt: '0 0% 95%',
        surfaceInverse: '0 0% 8%',
        textPrimary: '0 0% 10%',
        textSecondary: '0 0% 35%',
        textInverse: '0 0% 100%',
        borderDefault: '0 0% 88%',
        borderFocus: '16 90% 50%',
        actionDefault: '16 90% 50%',
        actionHover: '16 90% 44%',
        actionActive: '16 90% 38%',
        actionDisabled: '0 0% 80%',
      },
      dark: {
        brandPrimary: '16 90% 55%',
        brandSecondary: '0 0% 95%',
        accent: '16 90% 55%',
        surface: '0 0% 7%',
        surfaceAlt: '0 0% 12%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '0 0% 96%',
        textSecondary: '0 0% 70%',
        textInverse: '0 0% 7%',
        borderDefault: '0 0% 20%',
        borderFocus: '16 90% 60%',
        actionDefault: '16 90% 55%',
        actionHover: '16 90% 62%',
        actionActive: '16 90% 68%',
        actionDisabled: '0 0% 25%',
      },
    },
  },
  restaurant: {
    label: 'Restaurant',
    description: 'Warm, appetite-associated palette. Photography-led.',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'lg',
    colors: {
      light: {
        brandPrimary: '9 65% 40%',
        brandSecondary: '40 30% 90%',
        accent: '84 25% 35%',
        surface: '40 40% 98%',
        surfaceAlt: '40 30% 93%',
        surfaceInverse: '9 30% 14%',
        textPrimary: '9 20% 15%',
        textSecondary: '9 10% 40%',
        textInverse: '40 40% 98%',
        borderDefault: '40 20% 85%',
        borderFocus: '9 65% 45%',
        actionDefault: '9 65% 40%',
        actionHover: '9 65% 34%',
        actionActive: '9 65% 28%',
        actionDisabled: '40 15% 80%',
      },
      dark: {
        brandPrimary: '9 65% 55%',
        brandSecondary: '40 30% 90%',
        accent: '84 30% 50%',
        surface: '9 20% 10%',
        surfaceAlt: '9 18% 14%',
        surfaceInverse: '40 40% 98%',
        textPrimary: '40 30% 95%',
        textSecondary: '40 10% 70%',
        textInverse: '9 20% 10%',
        borderDefault: '9 15% 24%',
        borderFocus: '9 65% 60%',
        actionDefault: '9 65% 55%',
        actionHover: '9 65% 62%',
        actionActive: '9 65% 68%',
        actionDisabled: '9 10% 28%',
      },
    },
  },
  hotel: {
    label: 'Hotel',
    description: 'Calming, generous, luxury-adjacent pacing.',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'lg',
    colors: {
      light: {
        brandPrimary: '190 35% 30%',
        brandSecondary: '35 30% 85%',
        accent: '35 45% 55%',
        surface: '40 25% 98%',
        surfaceAlt: '40 20% 94%',
        surfaceInverse: '190 25% 14%',
        textPrimary: '190 20% 15%',
        textSecondary: '190 10% 40%',
        textInverse: '40 25% 98%',
        borderDefault: '40 15% 86%',
        borderFocus: '190 35% 40%',
        actionDefault: '190 35% 30%',
        actionHover: '190 35% 24%',
        actionActive: '190 35% 20%',
        actionDisabled: '40 10% 80%',
      },
      dark: {
        brandPrimary: '190 35% 55%',
        brandSecondary: '35 30% 85%',
        accent: '35 45% 60%',
        surface: '190 20% 10%',
        surfaceAlt: '190 18% 14%',
        surfaceInverse: '40 25% 98%',
        textPrimary: '40 25% 95%',
        textSecondary: '40 10% 70%',
        textInverse: '190 20% 10%',
        borderDefault: '190 15% 24%',
        borderFocus: '190 35% 62%',
        actionDefault: '190 35% 55%',
        actionHover: '190 35% 62%',
        actionActive: '190 35% 68%',
        actionDisabled: '190 10% 28%',
      },
    },
  },
  legal: {
    label: 'Legal',
    description: 'Lowest motion intensity. Deep navy/forest + muted gold.',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'sm',
    colors: {
      light: {
        brandPrimary: '160 40% 20%',
        brandSecondary: '42 35% 50%',
        accent: '42 35% 50%',
        surface: '0 0% 100%',
        surfaceAlt: '160 10% 96%',
        surfaceInverse: '160 30% 12%',
        textPrimary: '160 20% 14%',
        textSecondary: '160 8% 38%',
        textInverse: '0 0% 100%',
        borderDefault: '160 12% 86%',
        borderFocus: '160 40% 30%',
        actionDefault: '160 40% 20%',
        actionHover: '160 40% 16%',
        actionActive: '160 40% 12%',
        actionDisabled: '160 8% 80%',
      },
      dark: {
        brandPrimary: '160 40% 45%',
        brandSecondary: '42 35% 60%',
        accent: '42 35% 60%',
        surface: '160 25% 9%',
        surfaceAlt: '160 22% 13%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '160 10% 95%',
        textSecondary: '160 8% 68%',
        textInverse: '160 25% 9%',
        borderDefault: '160 15% 22%',
        borderFocus: '160 40% 55%',
        actionDefault: '160 40% 45%',
        actionHover: '160 40% 52%',
        actionActive: '160 40% 58%',
        actionDisabled: '160 10% 26%',
      },
    },
  },
  construction: {
    label: 'Construction',
    description: 'Safety-adjacent but refined. Amber/steel with harder edges.',
    fontDisplay: "'Barlow Condensed', sans-serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'sm',
    colors: {
      light: {
        brandPrimary: '32 85% 45%',
        brandSecondary: '215 15% 35%',
        accent: '205 60% 40%',
        surface: '0 0% 100%',
        surfaceAlt: '210 10% 96%',
        surfaceInverse: '215 20% 14%',
        textPrimary: '215 20% 14%',
        textSecondary: '215 10% 40%',
        textInverse: '0 0% 100%',
        borderDefault: '214 15% 86%',
        borderFocus: '32 85% 45%',
        actionDefault: '32 85% 45%',
        actionHover: '32 85% 38%',
        actionActive: '32 85% 32%',
        actionDisabled: '214 10% 80%',
      },
      dark: {
        brandPrimary: '32 85% 55%',
        brandSecondary: '215 15% 65%',
        accent: '205 60% 55%',
        surface: '215 18% 10%',
        surfaceAlt: '215 16% 14%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '210 10% 95%',
        textSecondary: '215 8% 68%',
        textInverse: '215 18% 10%',
        borderDefault: '215 12% 24%',
        borderFocus: '32 85% 60%',
        actionDefault: '32 85% 55%',
        actionHover: '32 85% 62%',
        actionActive: '32 85% 68%',
        actionDisabled: '215 10% 28%',
      },
    },
  },
  technology: {
    label: 'Technology',
    description: 'Dark-first, crisp. Vivid single accent on near-black/white.',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'Inter', sans-serif",
    radiusDefault: 'md',
    colors: {
      light: {
        brandPrimary: '255 85% 60%',
        brandSecondary: '0 0% 20%',
        accent: '255 85% 60%',
        surface: '0 0% 100%',
        surfaceAlt: '240 10% 97%',
        surfaceInverse: '240 10% 6%',
        textPrimary: '240 10% 10%',
        textSecondary: '240 6% 40%',
        textInverse: '0 0% 100%',
        borderDefault: '240 10% 88%',
        borderFocus: '255 85% 60%',
        actionDefault: '255 85% 60%',
        actionHover: '255 85% 53%',
        actionActive: '255 85% 46%',
        actionDisabled: '240 8% 80%',
      },
      dark: {
        brandPrimary: '255 85% 68%',
        brandSecondary: '0 0% 90%',
        accent: '255 85% 68%',
        surface: '240 10% 6%',
        surfaceAlt: '240 10% 10%',
        surfaceInverse: '0 0% 100%',
        textPrimary: '240 6% 96%',
        textSecondary: '240 6% 68%',
        textInverse: '240 10% 6%',
        borderDefault: '240 8% 20%',
        borderFocus: '255 85% 68%',
        actionDefault: '255 85% 68%',
        actionHover: '255 85% 74%',
        actionActive: '255 85% 80%',
        actionDisabled: '240 8% 26%',
      },
    },
  },
};

export const themeNames = Object.keys(themes) as ThemeName[];
