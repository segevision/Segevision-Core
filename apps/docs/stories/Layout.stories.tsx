import type { Meta, StoryObj } from '@storybook/react';
import { Section, Container, Stack, Grid, Divider, Card, Text } from '@segevision/ui';

const meta: Meta = {
  title: 'Foundation/Layout',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const SectionBackgrounds: Story = {
  render: () => (
    <Stack gap={0}>
      <Section padding="sm" background="surface">
        <Text>background=&quot;surface&quot;</Text>
      </Section>
      <Section padding="sm" background="surface-alt">
        <Text>background=&quot;surface-alt&quot;</Text>
      </Section>
      <Section padding="sm" background="inverse">
        <Text color="inverse">background=&quot;inverse&quot;</Text>
      </Section>
    </Stack>
  ),
};

export const StackDirections: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack direction="row" gap={3}>
        <Card style={{ padding: '1rem' }}>row 1</Card>
        <Card style={{ padding: '1rem' }}>row 2</Card>
        <Card style={{ padding: '1rem' }}>row 3</Card>
      </Stack>
      <Stack direction="column" gap={3}>
        <Card style={{ padding: '1rem' }}>column 1</Card>
        <Card style={{ padding: '1rem' }}>column 2</Card>
      </Stack>
    </Stack>
  ),
};

export const GridColumns: Story = {
  render: () => (
    <Grid columns={4} gap={4}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} style={{ padding: '1rem', textAlign: 'center' }}>
          {i + 1}
        </Card>
      ))}
    </Grid>
  ),
};

export const DividerWithLabel: Story = {
  render: () => (
    <Container>
      <Divider label="או" />
    </Container>
  ),
};
