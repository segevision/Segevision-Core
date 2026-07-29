import type { Meta, StoryObj } from '@storybook/react';
import { Icon, Logo, Stack } from '@segevision/ui';
import {
  PhoneIcon,
  WhatsAppIcon,
  ChevronDownIcon,
  ArrowIcon,
  CheckIcon,
  CloseIcon,
  MenuIcon,
  StarIcon,
  MapPinIcon,
} from '@segevision/icons';

const meta: Meta = {
  title: 'Foundation/Icons & Logo',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const IconSet: Story = {
  render: () => (
    <Stack direction="row" gap={4} wrap>
      {[PhoneIcon, WhatsAppIcon, ChevronDownIcon, ArrowIcon, CheckIcon, CloseIcon, MenuIcon, StarIcon, MapPinIcon].map(
        (IconCmp, i) => (
          <Icon key={i} icon={IconCmp} size={32} />
        ),
      )}
    </Stack>
  ),
};

export const DirectionalIconFlip: Story = {
  render: () => (
    <Stack direction="row" gap={4} align="center">
      <Icon icon={ArrowIcon} size={32} flipRtl />
      <span>flipRtl — flips automatically under dir=&quot;rtl&quot;</span>
    </Stack>
  ),
};

export const LogoSizes: Story = {
  render: () => (
    <Stack gap={4}>
      <Logo name="Physiothletics" size="sm" />
      <Logo name="Physiothletics" size="md" />
      <Logo name="Physiothletics" size="lg" />
    </Stack>
  ),
};
