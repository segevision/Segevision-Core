import type { Meta, StoryObj } from '@storybook/react';
import { TeamGrid } from '@segevision/ui';
import { FullBleed, teamMembers } from '../section-fixtures';

const meta: Meta<typeof TeamGrid> = {
  title: 'Sections/TeamGrid',
  component: TeamGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <FullBleed><Story /></FullBleed>],
  args: {
    eyebrow: 'הצוות',
    title: 'מי יטפל בכם',
    lead: 'המטפלים שילוו אתכם מהאבחון ועד החזרה לפעילות.',
    members: teamMembers,
  },
};
export default meta;
type Story = StoryObj<typeof TeamGrid>;

/** Photography is usually missing at concept stage — the placeholder states the brief. */
export const WithPhotoPlaceholders: Story = {};
export const WithoutPhotos: Story = {
  args: { members: teamMembers.map(({ photo, ...rest }) => rest) },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
