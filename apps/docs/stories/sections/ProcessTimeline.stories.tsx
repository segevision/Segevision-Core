import type { Meta, StoryObj } from '@storybook/react';
import { Button, ProcessTimeline } from '@segevision/ui';
import { FullBleed, processSteps } from '../section-fixtures';

const meta: Meta<typeof ProcessTimeline> = {
  title: 'Sections/ProcessTimeline',
  component: ProcessTimeline,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'איך זה עובד',
    title: 'הדרך מהפגישה הראשונה ועד החזרה למגרש',
    lead: 'תהליך ברור בחמישה שלבים.',
    steps: processSteps,
  },
};
export default meta;
type Story = StoryObj<typeof ProcessTimeline>;

export const OnInk: Story = {};
export const OnSurface: Story = { args: { tone: 'surface' } };
export const WithFooterCta: Story = {
  args: { footer: <Button size="lg">לקביעת תור</Button> },
};
/** Below 1024px the horizontal rail becomes a vertical, numbered list. */
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
