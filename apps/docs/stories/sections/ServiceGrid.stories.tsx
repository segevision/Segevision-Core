import type { Meta, StoryObj } from '@storybook/react';
import { ServiceGrid } from '@segevision/ui';
import { FullBleed, services } from '../section-fixtures';

const meta: Meta<typeof ServiceGrid> = {
  title: 'Sections/ServiceGrid',
  component: ServiceGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'תחומי הטיפול',
    title: 'ארבעה מסלולים, אותה רמת ליווי',
    lead: 'כל מסלול נבנה סביב אבחנה אישית.',
    items: services,
  },
};
export default meta;
type Story = StoryObj<typeof ServiceGrid>;

/** 7-5-5-7 tiling: two of four cards get visual priority without breaking the rows. */
export const Bento: Story = {};
export const EvenColumns: Story = { args: { layout: 'even' } };
export const ThreeItems: Story = { args: { items: services.slice(0, 3) } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
