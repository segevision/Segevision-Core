import type { Meta, StoryObj } from '@storybook/react';
import { PlaceholderLog } from '@segevision/ui';
import { placeholderEntries } from '../section-fixtures';

const meta: Meta<typeof PlaceholderLog> = {
  title: 'Foundation/PlaceholderLog',
  component: PlaceholderLog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ minHeight: '60vh' }}><Story /></div>],
  args: { entries: placeholderEntries },
};
export default meta;
type Story = StoryObj<typeof PlaceholderLog>;

/**
 * Review-build panel listing every unconfirmed detail. Click the pill to open it;
 * Escape closes and returns focus to the trigger.
 */
export const Default: Story = {};

/** A conflict records every competing value rather than silently picking one. */
export const ConflictOnly: Story = { args: { entries: placeholderEntries.slice(0, 1) } };

/** With nothing outstanding the component renders nothing at all. */
export const Empty: Story = { args: { entries: [] } };
