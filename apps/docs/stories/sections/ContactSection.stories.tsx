import type { Meta, StoryObj } from '@storybook/react';
import { ContactSection, ImagePlaceholder } from '@segevision/ui';
import { FullBleed, contactChannels } from '../section-fixtures';

const meta: Meta<typeof ContactSection> = {
  title: 'Sections/ContactSection',
  component: ContactSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'הגעה ויצירת קשר',
    title: 'איפה אנחנו נמצאים',
    lead: 'במרחק נסיעה קצר מרוב יישובי האזור.',
    channels: contactChannels,
    hoursTitle: 'שעות פעילות',
    hours: [
      { days: 'ראשון – חמישי', hours: '08:00 – 19:00' },
      { days: 'שישי', hours: '08:00 – 12:00' },
      { days: 'שבת', hours: 'סגור' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ContactSection>;

/** A real map goes in only once the address is verified; until then, a stated placeholder. */
export const WithMapPlaceholder: Story = {
  args: {
    map: <ImagePlaceholder label="מפת הגעה" ratio="16 / 10" tone="brand" className="h-full" />,
    hoursNote: 'שעות אלו הן מבנה לעיצוב בלבד ואינן שעות הפעילות בפועל.',
  },
};
export const WithoutMap: Story = {};
export const Mobile: Story = {
  args: { map: <ImagePlaceholder label="מפת הגעה" ratio="16 / 10" tone="brand" /> },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
