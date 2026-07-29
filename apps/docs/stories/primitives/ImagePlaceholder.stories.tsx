import type { Meta, StoryObj } from '@storybook/react';
import { ImagePlaceholder } from '@segevision/ui';

const meta: Meta<typeof ImagePlaceholder> = {
  title: 'Foundation/ImagePlaceholder',
  component: ImagePlaceholder,
  tags: ['autodocs'],
  args: {
    label: 'ספורטאי בשלב שיקום אקטיבי בקליניקה',
    note: 'צילום אנכי, אור טבעי, רגע של עבודה אמיתית.',
  },
  argTypes: { tone: { control: 'select', options: ['brand', 'ink', 'neutral'] } },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ImagePlaceholder>;

export const Brand: Story = {};
export const Ink: Story = { args: { tone: 'ink' } };
export const Neutral: Story = { args: { tone: 'neutral' } };
export const Portrait: Story = { args: { ratio: '4 / 5' } };
export const Wide: Story = { args: { ratio: '16 / 9', label: 'תמונת רוחב לראש העמוד' } };
/** Once a real image exists, the placeholder treatment disappears entirely. */
export const WithRealImage: Story = {
  args: {
    src:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%230d3f45"/></svg>',
      ),
    alt: 'תמונת דוגמה',
  },
};
