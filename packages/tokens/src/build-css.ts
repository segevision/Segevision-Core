import {
  breakpoints,
  durationScale,
  easingScale,
  fontSizeScale,
  fontWeightScale,
  iconSizeScale,
  lineHeightScale,
  radiusScale,
  spaceScale,
} from './primitives';
import {
  semanticStatusColors,
  themes,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeName,
} from './themes';

// CSS custom-property idents can't contain a bare ".", so "0.5" -> "0_5".
const sanitizeKey = (key: string) => key.replace('.', '_');

const toVarBlock = (obj: Record<string, string>, prefix: string) =>
  Object.entries(obj)
    .map(([key, value]) => `  --${prefix}-${sanitizeKey(key)}: ${value};`)
    .join('\n');

/**
 * Base tokens shared by every theme — spacing, radius scale, type scale, motion, breakpoints.
 * These NEVER change per theme (Design System v1, Part 7 — Layer 2 non-color tokens).
 */
function buildBaseLayer(): string {
  return `:root {
${toVarBlock(spaceScale, 'space')}
${toVarBlock(fontSizeScale, 'font-size')}
${toVarBlock(lineHeightScale, 'line-height')}
${toVarBlock(fontWeightScale, 'font-weight')}
${toVarBlock(radiusScale, 'radius')}
${toVarBlock(breakpoints, 'breakpoint')}
${toVarBlock(durationScale, 'duration')}
${toVarBlock(easingScale, 'easing')}
${toVarBlock(iconSizeScale, 'icon-size')}
  --motion-scale: 1;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-scale: 0;
  }
}
`;
}

function buildColorBlock(name: string, mode: ThemeMode, definition?: ThemeDefinition): string {
  const theme = definition ?? themes[name as ThemeName];
  const colors = theme.colors[mode];
  const status = semanticStatusColors[mode];
  const selector = mode === 'light' ? `[data-theme='${name}']` : `[data-theme='${name}'].dark`;
  return `${selector} {
  --color-brand-primary: ${colors.brandPrimary};
  --color-brand-secondary: ${colors.brandSecondary};
  --color-accent: ${colors.accent};
  --color-surface: ${colors.surface};
  --color-surface-alt: ${colors.surfaceAlt};
  --color-surface-inverse: ${colors.surfaceInverse};
  --color-text-primary: ${colors.textPrimary};
  --color-text-secondary: ${colors.textSecondary};
  --color-text-inverse: ${colors.textInverse};
  --color-border-default: ${colors.borderDefault};
  --color-border-focus: ${colors.borderFocus};
  --color-action-default: ${colors.actionDefault};
  --color-action-hover: ${colors.actionHover};
  --color-action-active: ${colors.actionActive};
  --color-action-disabled: ${colors.actionDisabled};
  --color-success: ${status.success};
  --color-warning: ${status.warning};
  --color-danger: ${status.danger};
  --color-info: ${status.info};
  --font-display: ${theme.fontDisplay};
  --font-body: ${theme.fontBody};
  --radius-default: var(--radius-${theme.radiusDefault});
}
`;
}

/**
 * Generates the full tokens.css — base layer + every theme's light/dark color block.
 * Themes are switched purely via the `data-theme` attribute + `.dark` class (see
 * @segevision/ui ThemeProvider) — no component ever needs to know which theme is active.
 */
export function buildTokensCss(): string {
  const themeNames = Object.keys(themes) as ThemeName[];
  const blocks = themeNames.flatMap((name) => [
    buildColorBlock(name, 'light'),
    buildColorBlock(name, 'dark'),
  ]);
  return [buildBaseLayer(), ...blocks].join('\n');
}

/**
 * Emits the light + dark `[data-theme='<name>']` blocks for a client-specific brand
 * theme that is NOT part of the shared preset list. A client app calls this at build
 * time and inlines the result, so a one-off brand never has to be merged into
 * @segevision/tokens (which would force every other client to carry it).
 */
export function buildClientThemeCss(name: string, definition: ThemeDefinition): string {
  return [
    buildColorBlock(name, 'light', definition),
    buildColorBlock(name, 'dark', definition),
  ].join('\n');
}
