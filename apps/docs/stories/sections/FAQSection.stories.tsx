import type { Meta, StoryObj } from '@storybook/react';
import { Button, FAQSection } from '@segevision/ui';
import { FullBleed, faqItems } from '../section-fixtures';

const meta: Meta<typeof FAQSection> = {
  title: 'Sections/FAQSection',
  component: FAQSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'לפני שמתקשרים',
    title: 'שאלות שאנחנו שומעים הכי הרבה',
    lead: 'לא מצאתם תשובה? שאלו אותנו ישירות.',
    items: faqItems,
  },
};
export default meta;
type Story = StoryObj<typeof FAQSection>;

/** Single-open by default: the page never grows under the reader's thumb. */
export const SingleOpen: Story = { args: { defaultOpenId: 'referral' } };
export const AllowMultiple: Story = { args: { allowMultiple: true } };
export const WithAside: Story = {
  args: { aside: <Button variant="secondary">שיחה בוואטסאפ</Button> },
};
/** `pending` answers stay visible and labelled rather than being hidden. */
export const WithPendingAnswer: Story = { args: { defaultOpenId: 'sessions' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
