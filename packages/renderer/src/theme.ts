import type { Project, ProjectDesign } from './schema';

/**
 * Turns a project's design settings into the CSS custom properties that
 * @segevision/tokens and the shared Tailwind preset already consume.
 *
 * Nothing here invents a new styling channel: the renderer emits the exact same
 * variables the design system defines, which is why a client site and the platform
 * preview cannot drift apart.
 */

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): Hsl {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToCss({ h, s, l }: Hsl): string {
  return `${h} ${s}% ${l}%`;
}

function shift(color: Hsl, delta: number): Hsl {
  return { ...color, l: Math.max(0, Math.min(100, color.l + delta)) };
}

/** Relative luminance, used for the contrast guard below. */
function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(clean.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

const RADIUS_VALUES: Record<ProjectDesign['radius'], string> = {
  sharp: '4px',
  soft: '12px',
  round: '20px',
};

export const RADIUS_LABELS: Record<ProjectDesign['radius'], string> = {
  sharp: 'חד',
  soft: 'רך',
  round: 'מעוגל',
};

export const BUTTON_STYLE_LABELS: Record<ProjectDesign['buttonStyle'], string> = {
  solid: 'מלא',
  outline: 'מתאר',
  ghost: 'שקוף',
};

export const BACKGROUND_MODE_LABELS: Record<ProjectDesign['backgroundMode'], string> = {
  light: 'בהיר',
  dark: 'כהה',
};

/**
 * The action colour is what carries white button text. A brand colour chosen for a
 * logo is often too light for that, so the button variant is darkened until it clears
 * 4.5:1 — the brand colour itself is left exactly as the user picked it.
 */
function readableActionColor(primary: Hsl, mode: ProjectDesign['backgroundMode']): Hsl {
  if (mode === 'dark') return primary.l < 45 ? { ...primary, l: 55 } : primary;
  return primary.l > 52 ? { ...primary, l: 40 } : primary;
}

export function buildProjectThemeCss(project: Project): string {
  const { design } = project;
  const primary = hexToHsl(design.primaryColor);
  const secondary = hexToHsl(design.secondaryColor);
  const dark = design.backgroundMode === 'dark';
  const action = readableActionColor(primary, design.backgroundMode);

  const vars = [
    `--color-brand-primary: ${hslToCss(primary)};`,
    `--color-brand-secondary: ${hslToCss(secondary)};`,
    `--color-accent: ${hslToCss(secondary)};`,
    `--color-action-default: ${hslToCss(action)};`,
    `--color-action-hover: ${hslToCss(shift(action, dark ? 7 : -6))};`,
    `--color-action-active: ${hslToCss(shift(action, dark ? 13 : -11))};`,
    `--color-border-focus: ${hslToCss(shift(primary, dark ? 10 : 12))};`,
    `--radius-default: ${RADIUS_VALUES[design.radius]};`,
    `--font-display: '${design.headingFont}', system-ui, sans-serif;`,
    `--font-body: '${design.bodyFont}', system-ui, sans-serif;`,
  ].join('\n  ');

  // html[data-theme] outranks the token file's [data-theme='x'] selector, so these
  // overrides win for every preset without having to know which preset is active.
  return `html[data-theme] {\n  ${vars}\n}\n`;
}

/** Google Fonts URL covering only the two families a project actually uses. */
export function buildFontHref(design: ProjectDesign): string {
  const families = Array.from(new Set([design.headingFont, design.bodyFont]));
  const params = families
    .map((family) => {
      const name = family.replace(/ /g, '+');
      // Secular One ships a single weight; asking for a range returns nothing.
      const weights = family === 'Secular One' ? '' : ':wght@400;500;600;700;800';
      return `family=${name}${weights}`;
    })
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
