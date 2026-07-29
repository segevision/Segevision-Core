import type { Meta, StoryObj } from '@storybook/react';
import { AwardIcon, CalendarIcon, PhoneIcon, WhatsAppIcon } from '@segevision/icons';
import { HeroSection, ImagePlaceholder } from '@segevision/ui';
import { FullBleed } from '../section-fixtures';

const meta: Meta<typeof HeroSection> = {
  title: 'Sections/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'תחום העיסוק · אזור גיאוגרפי',
    titleLines: [
      { text: 'המשפט שמוכר.', tone: 'default' },
      { text: 'והמשפט שמסייג אותו.', tone: 'muted' },
    ],
    lead: 'פסקת פתיחה קצרה שמסבירה למי השירות מתאים ומה הוא כולל, בלי להבטיח תוצאה.',
    actions: [
      { label: 'לקביעת תור', href: '#' },
      { label: 'שיחה בוואטסאפ', href: '#', variant: 'secondary', icon: WhatsAppIcon },
      { label: 'התקשרו אלינו', href: '#', variant: 'ghost', icon: PhoneIcon },
    ],
    credentials: [
      { icon: CalendarIcon, label: 'פעילים מאז 2011' },
      { icon: AwardIcon, label: 'הכשרה בינלאומית' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof HeroSection>;

export const WithMedia: Story = {
  args: {
    media: <ImagePlaceholder label="תמונת הירו" ratio="4 / 5" tone="ink" />,
  },
};

/** Text-only variant, for clients with no usable photography at launch. */
export const TextOnly: Story = {};

export const Mobile: Story = {
  args: { media: <ImagePlaceholder label="תמונת הירו" ratio="4 / 5" tone="ink" /> },
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

export const Tablet: Story = {
  args: { media: <ImagePlaceholder label="תמונת הירו" ratio="4 / 5" tone="ink" /> },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
