import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card, CardHeader, CardBody, CardFooter } from '../Card';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Button } from '../Button';

describe('Card', () => {
  it('renders a composed card with no accessibility violations', async () => {
    const { container } = render(
      <Card interactive>
        <CardHeader>
          <Heading level={3} size="2xl">
            Sports Physiotherapy
          </Heading>
        </CardHeader>
        <CardBody>
          <Text color="secondary">Personalized rehab for athletes.</Text>
        </CardBody>
        <CardFooter>
          <Button size="sm">Learn more</Button>
        </CardFooter>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
