import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, Heading, Text, Button, Stack } from '@segevision/ui';

/**
 * Theme / Mode / Direction are controlled globally via the Storybook toolbar
 * (top of the UI) — see .storybook/preview.tsx. This story just gives a
 * representative composition to inspect while switching those globals.
 */
const meta: Meta = {
  title: 'Foundation/Theming Playground',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: () => (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader>
        <Heading level={2} size="3xl">
          פיזיותלטיקס
        </Heading>
      </CardHeader>
      <CardBody>
        <Stack gap={3}>
          <Text color="secondary">
            השתמשו בסרגל הכלים למעלה כדי להחליף Theme / Mode / Direction ולראות
            שהרכיב הזה לא משתנה — רק הטוקנים משתנים.
          </Text>
          <Stack direction="row" gap={2} wrap>
            <Button>קביעת תור</Button>
            <Button variant="secondary">התקשרו</Button>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  ),
};
