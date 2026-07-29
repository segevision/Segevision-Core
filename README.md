# Segevision Core

The reusable engine behind the Segevision Website Factory — design tokens, the
`@segevision/ui` foundation component library, and Storybook. Physiothletics
will be the first *consumer* of this package, not a fork of it.

Implements: Website Factory Architecture (approved) + Segevision Design System v1
(approved). No client pages, industry templates, or Physiothletics-specific
content are built here — foundation only, per the build brief.

## Requirements

- Node.js 18+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9 --activate`, or `npm i -g pnpm`)

## Setup

```bash
pnpm install
pnpm --filter @segevision/tokens build   # generates packages/tokens/css/tokens.css
```

## Run the demo app (Next.js)

```bash
pnpm --filter @segevision/demo dev
# → http://localhost:3300
```

Shows every foundation component (Button, Card, Heading, Text, Stack, Grid,
Icon, Divider, Logo) themed with the "medical" preset, in Hebrew/RTL by
default, with a toolbar to switch theme / light-dark mode / RTL-LTR live.

## Run Storybook

```bash
pnpm --filter @segevision/docs storybook
# → http://localhost:6006
```

Every component has stories covering variants, sizes, and states. Use the
toolbar (top of the Storybook UI) to switch **Theme**, **Mode** (light/dark),
and **Direction** (RTL/LTR) globally across every story — proves the same
component renders correctly under all nine brand themes without any code change.
The **Viewport** addon (also in the toolbar) switches between Mobile / Tablet /
Desktop / Wide. The **Accessibility** tab (bottom panel) runs a live WCAG 2.1 AA
audit against whatever story is open.

## Run tests

```bash
pnpm --filter @segevision/ui test        # Vitest — unit + accessibility (axe) tests
pnpm --filter @segevision/ui typecheck   # strict TypeScript, zero errors
pnpm e2e                                  # Playwright — functional + a11y against the demo app
```

`pnpm e2e` starts the demo app automatically (`playwright.config.ts` `webServer`)
and requires a machine with standard Chromium system libraries (any normal
desktop/CI image has these — see VERIFICATION.md for why this couldn't be
executed inside the sandbox this was built in).

## Build everything

```bash
pnpm build              # turbo: tokens + demo (Next.js production build)
pnpm build-storybook    # static Storybook site → apps/docs/storybook-static
```

## Package map

| Package | Purpose |
|---|---|
| `@segevision/tokens` | Design tokens — primitives, 9 brand theme presets, generated CSS |
| `@segevision/utils` | `cn()` class-merging helper |
| `@segevision/hooks` | `useMediaQuery`, `usePrefersReducedMotion`, `useDirection` |
| `@segevision/icons` | Base SVG icon set (Phone, WhatsApp, Chevron, Arrow, Check, Close, Menu, Star, MapPin) |
| `@segevision/animations` | Framer Motion presets (fadeUp, staggerContainer, scaleHover, etc.), reduced-motion aware |
| `@segevision/core` | Theme registry (`listThemes`, `getTheme`) tying tokens to the Website Factory's theme-selection step |
| `@segevision/templates` | Reserved for Phase 2 (industry templates) — intentionally empty |
| `@segevision/ui` | Button, Container, Section, Heading, Text, Card, Stack, Grid, Icon, Divider, Logo, ThemeProvider, RTLProvider |
| `@segevision/config` | Shared Tailwind preset bridging tokens → utility classes |
| `apps/demo` | Next.js app proving the foundation end-to-end |
| `apps/docs` | Storybook |

See `VERIFICATION.md` for exactly what was tested and how, and `SEGEVISION_DESIGN_SYSTEM_V1.md` / the Website Factory Architecture doc (in the client project folder) for the source specification this implements.
