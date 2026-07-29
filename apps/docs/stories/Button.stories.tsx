import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@segevision/ui';

const meta: Meta<typeof Button> = {
  title: 'Foundation/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: { children: 'קביעת תור', variant: 'primary', size: 'md' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
      <Button iconOnly aria-label="Icon only example">
        +
      </Button>
    </div>
  ),
};

export const Mobile: Story = {
  args: { children: 'קביעת תור', size: 'lg' },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

export const Tablet: Story = {
  args: { children: 'קביעת תור', size: 'lg' },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};

export const Desktop: Story = {
  args: { children: 'קביעת תור', size: 'lg' },
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
