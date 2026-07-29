import type { Preview, Decorator } from '@storybook/react';
import * as React from 'react';
import { ThemeProvider, RTLProvider } from '@segevision/ui';
import { themeNames } from '@segevision/core';
import './globals.css';

const withProviders: Decorator = (Story, context) => {
  const { theme, mode, direction } = context.globals;
  return (
    <ThemeProvider defaultTheme={theme} defaultMode={mode} asChild key={`${theme}-${mode}`}>
      <RTLProvider defaultDirection={direction} asChild key={direction}>
        <div style={{ padding: '1.5rem', fontFamily: 'var(--font-body)' }}>
          <Story />
        </div>
      </RTLProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Every story is checked against this ruleset — WCAG 2.1 AA, per
      // Design System v1 Part 6 and the Website Factory's Accessibility Agent.
      config: {},
      options: { runOnly: ['wcag2a', 'wcag2aa'] },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
        wide: { name: 'Wide', styles: { width: '1536px', height: '900px' } },
      },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Brand theme preset',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: themeNames.map((name) => ({ value: name, title: name })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light / Dark',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'RTL / LTR',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'rtl', title: 'RTL' },
          { value: 'ltr', title: 'LTR' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'medical',
    mode: 'light',
    direction: 'rtl',
  },
  decorators: [withProviders],
};

export default preview;
