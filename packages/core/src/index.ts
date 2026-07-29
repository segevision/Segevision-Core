import { themes, themeNames, type ThemeName, type ThemeDefinition } from '@segevision/tokens';

/**
 * Thin registry layer tying the Website Factory Architecture's "theme selection"
 * step to the token layer. This is intentionally NOT a component — it's the
 * logic a future Brand Agent / client-config step reads to know what themes exist.
 */
export function listThemes(): { name: ThemeName; label: string; description: string }[] {
  return themeNames.map((name) => ({
    name,
    label: themes[name].label,
    description: themes[name].description,
  }));
}

export function getTheme(name: ThemeName): ThemeDefinition {
  const theme = themes[name];
  if (!theme) {
    throw new Error(
      `[@segevision/core] Unknown theme "${name}". Available: ${themeNames.join(', ')}`,
    );
  }
  return theme;
}

export { themeNames };
export type { ThemeName, ThemeDefinition };
