import type { Meta, StoryObj } from '@storybook/react';
import { FeatureGrid } from '@segevision/ui';
import { FullBleed, featureItems } from '../section-fixtures';

const meta: Meta<typeof FeatureGrid> = {
  title: 'Sections/FeatureGrid',
  component: FeatureGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'למה אנחנו',
    title: 'קליניקה קטנה, בכוונה',
    lead: 'ארבעה הבדלים אמיתיים, בלי סופרלטיבים.',
    items: featureItems,
  },
};
export default meta;
type Story = StoryObj<typeof FeatureGrid>;

export const FourColumns: Story = {};
export const ThreeColumns: Story = { args: { columns: 3, items: featureItems.slice(0, 3) } };
export const TwoColumns: Story = { args: { columns: 2, items: featureItems.slice(0, 2) } };
export const OnInk: Story = { args: { tone: 'ink' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
