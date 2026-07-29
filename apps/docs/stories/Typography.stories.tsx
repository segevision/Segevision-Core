import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack } from '@segevision/ui';

const meta: Meta = {
  title: 'Foundation/Typography',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const HeadingScale: Story = {
  render: () => (
    <Stack gap={3}>
      <Heading level={1} size="7xl">
        7xl / H1
      </Heading>
      <Heading level={1} size="6xl">
        6xl / H1
      </Heading>
      <Heading level={2} size="4xl">
        4xl / H2
      </Heading>
      <Heading level={3} size="3xl">
        3xl / H3
      </Heading>
      <Heading level={4} size="2xl">
        2xl / H4
      </Heading>
    </Stack>
  ),
};

export const TextSizesAndColors: Story = {
  render: () => (
    <Stack gap={2}>
      <Text size="xl">xl — primary</Text>
      <Text size="lg" color="secondary">
        lg — secondary
      </Text>
      <Text size="base">base — primary (default body)</Text>
      <Text size="sm" color="secondary">
        sm — secondary
      </Text>
      <Text size="xs" color="secondary">
        xs — secondary
      </Text>
      <Text color="success">success</Text>
      <Text color="warning">warning</Text>
      <Text color="danger">danger</Text>
    </Stack>
  ),
};

export const HebrewRTLParagraph: Story = {
  render: () => (
    <Text size="lg" style={{ maxWidth: 560 }}>
      פיזיותלטיקס מספקת ללקוחותיה טיפול אישי ומקצועי, המתבסס על המחקרים העדכניים ביותר, כדי לתת
      מענה מהיר לקשת רחבה של בעיות וליקויים.
    </Text>
  ),
};
