import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tailwindPreset } = require('@segevision/config');

const config: Config = {
  presets: [tailwindPreset],
  content: ['./stories/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
};

export default config;
