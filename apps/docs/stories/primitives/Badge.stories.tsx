import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@segevision/ui';

const meta: Meta<typeof Badge> = {
  title: 'Foundation/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'accent', 'inverse'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { children: 'תווית' },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="accent">Accent</Badge>
      <span style={{ background: 'hsl(var(--color-surface-inverse))', padding: '0.5rem', borderRadius: 8 }}>
        <Badge variant="inverse">Inverse</Badge>
      </span>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge size="sm">קטן</Badge>
      <Badge size="md">בינוני</Badge>
    </div>
  ),
};
