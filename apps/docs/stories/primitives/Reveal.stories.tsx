import type { Meta, StoryObj } from '@storybook/react';
import { Card, Reveal, Text } from '@segevision/ui';

const meta: Meta<typeof Reveal> = {
  title: 'Foundation/Reveal',
  component: Reveal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Reveal>;

/**
 * Scroll down to trigger the entrance. Content starts *visible* and is only hidden
 * once JavaScript confirms the element is below the fold — so a failed hydration or
 * a crawler with no JS still sees a complete page.
 */
export const OnScroll: Story = {
  render: () => (
    <div style={{ padding: '1.5rem' }}>
      <Text>גללו מטה כדי לראות את הכניסה ההדרגתית.</Text>
      <div style={{ height: '90vh' }} />
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[0, 1, 2, 3].map((index) => (
          <Reveal key={index} delay={index * 0.08}>
            <Card>
              <Text>כרטיס {index + 1}</Text>
            </Card>
          </Reveal>
        ))}
      </div>
      <div style={{ height: '40vh' }} />
    </div>
  ),
};

/** Under prefers-reduced-motion the hidden state is never entered — no fade, no shift. */
export const ReducedMotion: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={{ padding: '1.5rem' }}>
      <Text>הפעילו "הפחתת תנועה" במערכת ההפעלה: התוכן יופיע מיד, בלי אנימציה.</Text>
      <Reveal>
        <Card>
          <Text>תוכן שמופיע מיד</Text>
        </Card>
      </Reveal>
    </div>
  ),
};
