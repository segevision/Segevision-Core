import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Grid } from '@segevision/ui';

const meta: Meta<typeof Card> = {
  title: 'Foundation/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader>
        <Heading level={3} size="2xl">
          פיזיותרפיית ספורט
        </Heading>
      </CardHeader>
      <CardBody>
        <Text color="secondary">שיקום פציעות ספורט לחובבים ומקצוענים.</Text>
      </CardBody>
      <CardFooter>
        <Button size="sm">קרא עוד</Button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive tabIndex={0} style={{ maxWidth: 360 }}>
      <CardHeader>
        <Heading level={3} size="2xl">
          Hover / focus me
        </Heading>
      </CardHeader>
      <CardBody>
        <Text color="secondary">elevation-1 → elevation-2 on hover, visible focus ring on Tab.</Text>
      </CardBody>
    </Card>
  ),
};

export const Grid3Up: Story = {
  render: () => (
    <Grid columns={3} gap={6}>
      {['פיזיותרפיה', 'פיזיותרפיית ספורט', 'פילאטיס קליני'].map((title) => (
        <Card key={title} interactive tabIndex={0}>
          <CardHeader>
            <Heading level={3} size="xl">
              {title}
            </Heading>
          </CardHeader>
          <CardBody>
            <Text color="secondary" size="sm">
              תיאור קצר של השירות.
            </Text>
          </CardBody>
        </Card>
      ))}
    </Grid>
  ),
};
