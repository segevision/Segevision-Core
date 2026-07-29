import type { Meta, StoryObj } from '@storybook/react';
import { PhoneIcon } from '@segevision/icons';
import { SiteHeader } from '@segevision/ui';
import { FullBleed, navItems } from '../section-fixtures';

const meta: Meta<typeof SiteHeader> = {
  title: 'Sections/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <FullBleed>
        <div style={{ minHeight: '150vh', background: 'hsl(var(--color-surface-alt))' }}>
          <Story />
        </div>
      </FullBleed>
    ),
  ],
  args: {
    brand: { name: 'שם הלקוח', tagline: 'תת־כותרת קצרה' },
    items: navItems,
    primaryAction: { label: 'לקביעת תור', href: '#' },
    secondaryAction: { label: '04-000-0000', href: 'tel:+972400000000', icon: PhoneIcon },
  },
};
export default meta;
type Story = StoryObj<typeof SiteHeader>;

export const Solid: Story = {};

/** Transparent over a dark hero, solidifying once the visitor scrolls. */
export const OverlayOnDarkHero: Story = {
  args: { overlay: true },
  decorators: [
    (Story) => (
      <FullBleed>
        <div style={{ minHeight: '150vh', background: 'hsl(var(--color-surface-inverse))' }}>
          <Story />
        </div>
      </FullBleed>
    ),
  ],
};

/** Below 1024px the nav collapses into a focus-trapped drawer. */
export const MobileDrawer: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
