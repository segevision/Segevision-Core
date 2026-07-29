import type { Meta, StoryObj } from '@storybook/react';
import { ProblemNeedSelector } from '@segevision/ui';
import { FullBleed, painDisclaimer, painOptions } from '../section-fixtures';

const meta: Meta<typeof ProblemNeedSelector> = {
  title: 'Sections/ProblemNeedSelector',
  component: ProblemNeedSelector,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'נתחיל מהדבר שהביא אתכם לכאן',
    title: 'איפה כואב?',
    lead: 'בחרו את האזור שמטריד אתכם ונראה לכם איך אנחנו ניגשים אליו.',
    options: painOptions,
    disclaimer: painDisclaimer,
  },
};
export default meta;
type Story = StoryObj<typeof ProblemNeedSelector>;

export const Default: Story = {};

/** Keyboard: arrows move between chips (flipped in RTL), Home/End jump to the ends. */
export const SecondOptionPreselected: Story = { args: { defaultOptionId: 'knee' } };

export const WithoutDisclaimer: Story = { args: { disclaimer: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
