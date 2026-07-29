import type { Meta, StoryObj } from '@storybook/react';
import { Button, SectionHeading } from '@segevision/ui';

const meta: Meta<typeof SectionHeading> = {
  title: 'Foundation/SectionHeading',
  component: SectionHeading,
  tags: ['autodocs'],
  args: {
    eyebrow: 'תחומי הטיפול',
    title: 'ארבעה מסלולים, אותה רמת ליווי',
    lead: 'כל מסלול נבנה סביב אבחנה אישית, ולא סביב חבילה מוכנה מראש.',
  },
};
export default meta;
type Story = StoryObj<typeof SectionHeading>;

export const Default: Story = {};
export const Centered: Story = { args: { align: 'center' } };
export const WithAside: Story = { args: { aside: <Button variant="secondary">כל השירותים</Button> } };
export const TitleOnly: Story = { args: { eyebrow: undefined, lead: undefined } };
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
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
