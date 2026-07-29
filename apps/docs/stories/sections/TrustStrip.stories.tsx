import type { Meta, StoryObj } from '@storybook/react';
import { TrustStrip } from '@segevision/ui';
import { FullBleed, trustItems } from '../section-fixtures';

const meta: Meta<typeof TrustStrip> = {
  title: 'Sections/TrustStrip',
  component: TrustStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><div style={{ padding: '3rem 0' }}><Story /></div></FullBleed>],
  args: { items: trustItems },
};
export default meta;
type Story = StoryObj<typeof TrustStrip>;

export const OnSurface: Story = {};
export const OnAlt: Story = { args: { tone: 'alt' } };
export const OnInk: Story = {
  args: { tone: 'ink' },
  decorators: [(Story) => <div style={{ background: 'hsl(var(--color-surface-inverse))', padding: '3rem 0' }}><Story /></div>],
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
