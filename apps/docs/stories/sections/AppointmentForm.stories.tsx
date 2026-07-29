import type { Meta, StoryObj } from '@storybook/react';
import { AppointmentForm } from '@segevision/ui';
import { FullBleed, appointmentCopy } from '../section-fixtures';

const meta: Meta<typeof AppointmentForm> = {
  title: 'Sections/AppointmentForm',
  component: AppointmentForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'קביעת תור',
    title: 'נשמח לשמוע מה קרה',
    lead: 'השאירו פרטים ונחזור אליכם טלפונית לתיאום מועד.',
    assurances: ['הפנייה נקראת על ידי אחד המטפלים', 'נחזור אליכם בשעות הפעילות'],
    copy: appointmentCopy,
  },
};
export default meta;
type Story = StoryObj<typeof AppointmentForm>;

/**
 * Without `onSubmit` the form runs in demo mode: it validates and shows the success
 * state, but says out loud that nothing was actually sent.
 */
export const DemoMode: Story = {
  args: { demoNotice: 'הערה לגרסת ההדגמה: הטופס אינו מחובר ליעד שליחה.' },
};

export const WithSubmitHandler: Story = {
  args: {
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
  },
};

/** Submitting empty surfaces per-field errors and moves focus to the first one. */
export const ValidationErrors: Story = {};

export const PrefilledTopic: Story = { args: { defaultTopic: 'knee' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
