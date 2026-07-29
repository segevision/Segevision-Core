import type { Meta, StoryObj } from '@storybook/react';
import { AuthorityFeature, ImagePlaceholder } from '@segevision/ui';
import { FullBleed } from '../section-fixtures';

const meta: Meta<typeof AuthorityFeature> = {
  title: 'Sections/AuthorityFeature',
  component: AuthorityFeature,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'הגישה שלנו',
    title: 'כשמבינים את הכאב, קל יותר לצאת ממנו',
    paragraphs: [
      'פסקה ראשונה שמסבירה את הרקע המקצועי ואת מקורו, בלי טענות שלא ניתן לגבות.',
      'פסקה שנייה שמחברת בין הרקע הזה לבין מה שקורה בפועל בקליניקה.',
    ],
    quote: { text: 'משפט מפתח אחד שנשאר בזיכרון.', attribution: 'מקור הציטוט' },
    points: ['נקודה ראשונה', 'נקודה שנייה', 'נקודה שלישית'],
    media: <ImagePlaceholder label="תמונה תומכת" ratio="4 / 5" />,
  },
};
export default meta;
type Story = StoryObj<typeof AuthorityFeature>;

export const MediaAtStart: Story = {};
export const MediaAtEnd: Story = { args: { mediaSide: 'end' } };
export const WithoutMedia: Story = { args: { media: undefined } };
/** `note` is where an unverified sourcing caveat goes, instead of quietly dropping it. */
export const WithSourcingNote: Story = {
  args: { note: 'הערה לצוות: היקף המעורבות המדויק ממתין לאישור הלקוח.' },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
