import type { Meta, StoryObj } from '@storybook/react';
import { FacebookIcon, InstagramIcon } from '@segevision/icons';
import { SiteFooter } from '@segevision/ui';
import { FullBleed } from '../section-fixtures';

const meta: Meta<typeof SiteFooter> = {
  title: 'Sections/SiteFooter',
  component: SiteFooter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    brand: { name: 'שם הלקוח', description: 'משפט אחד שמסביר מה העסק עושה ואיפה.' },
    columns: [
      { id: 'a', title: 'שירותים', links: [{ label: 'שירות ראשון', href: '#' }, { label: 'שירות שני', href: '#' }] },
      { id: 'b', title: 'העסק', links: [{ label: 'הצוות', href: '#' }, { label: 'שאלות נפוצות', href: '#' }] },
    ],
    contact: {
      title: 'יצירת קשר',
      lines: [
        { id: 'address', label: 'כתובת', value: 'רחוב הדוגמה 1, עיר' },
        { id: 'phone', label: 'טלפון', value: '04-000-0000', href: 'tel:+972400000000' },
      ],
    },
    socials: [
      { id: 'facebook', label: 'פייסבוק', href: '#', icon: FacebookIcon },
      { id: 'instagram', label: 'אינסטגרם', href: '#', icon: InstagramIcon },
    ],
    legalLinks: [{ label: 'תקנון', href: '#' }, { label: 'מדיניות פרטיות', href: '#' }],
    copyright: 'כל הזכויות שמורות לשם הלקוח, 2026',
    credit: { prefix: 'עיצוב ופיתוח:', label: 'Segevision', href: 'https://segevision.com' },
  },
};
export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Full: Story = {};
export const Minimal: Story = { args: { columns: [], socials: [], contact: undefined } };
/** Unconfirmed contact details carry a visible marker instead of shipping silently. */
export const WithPendingContactDetails: Story = {
  args: {
    contact: {
      title: 'יצירת קשר',
      lines: [{ id: 'phone', label: 'טלפון', value: '04-000-0000', pendingLabel: 'ערך פיתוח — ממתין לאימות' }],
    },
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
