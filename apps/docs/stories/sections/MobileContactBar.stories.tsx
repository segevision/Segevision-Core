import type { Meta, StoryObj } from '@storybook/react';
import { CalendarIcon, PhoneIcon, WhatsAppIcon } from '@segevision/icons';
import { MobileContactBar } from '@segevision/ui';
import { FullBleed } from '../section-fixtures';

const meta: Meta<typeof MobileContactBar> = {
  title: 'Sections/MobileContactBar',
  component: MobileContactBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile' } },
  decorators: [
    (Story) => (
      <FullBleed>
        <div style={{ minHeight: '200vh', padding: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)' }}>הבר נחשף לאחר גלילה מעבר לאזור ההירו.</p>
          <Story />
        </div>
      </FullBleed>
    ),
  ],
  args: {
    actions: [
      { id: 'call', label: 'התקשרו', href: 'tel:+972400000000', icon: PhoneIcon },
      { id: 'whatsapp', label: 'וואטסאפ', href: '#', icon: WhatsAppIcon },
      { id: 'appointment', label: 'קביעת תור', href: '#', icon: CalendarIcon, emphasis: true },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof MobileContactBar>;

export const HiddenUntilScrolled: Story = {};
/** Set `revealAfter: 0` to show it immediately — useful for reviewing the visuals. */
export const AlwaysVisible: Story = { args: { revealAfter: 0 } };
/** The bar is mobile-only: at tablet width and above it does not render. */
export const HiddenOnTablet: Story = {
  args: { revealAfter: 0 },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
