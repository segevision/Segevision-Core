import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from '@segevision/ui';

const meta: Meta<typeof Eyebrow> = {
  title: 'Foundation/Eyebrow',
  component: Eyebrow,
  tags: ['autodocs'],
  args: { children: 'תחומי הטיפול' },
  argTypes: { tone: { control: 'select', options: ['accent', 'inverse', 'muted'] } },
};
export default meta;
type Story = StoryObj<typeof Eyebrow>;

export const Playground: Story = {};
export const WithoutRule: Story = { args: { withRule: false } };
export const Muted: Story = { args: { tone: 'muted' } };
/** Uppercase is avoided on purpose: Hebrew has no case, so emphasis comes from weight and the rule. */
export const OnInk: Story = {
  args: { tone: 'inverse' },
  decorators: [
    (Story) => (
      <div style={{ background: 'hsl(var(--color-surface-inverse))', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};
