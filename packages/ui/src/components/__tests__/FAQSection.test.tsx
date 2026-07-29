import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FAQSection, type FAQItem } from '../../sections/FAQSection';

const items: FAQItem[] = [
  { id: 'a', question: 'שאלה ראשונה', answer: ['תשובה ראשונה'] },
  { id: 'b', question: 'שאלה שנייה', answer: ['תשובה שנייה'], pending: true, pendingLabel: 'ממתין לאישור' },
  { id: 'c', question: 'שאלה שלישית', answer: ['תשובה שלישית'] },
];

describe('FAQSection', () => {
  it('starts collapsed and reports the state through aria-expanded', () => {
    render(<FAQSection title="שאלות" items={items} />);

    expect(screen.getByRole('button', { name: 'שאלה ראשונה' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('תשובה ראשונה')).not.toBeInTheDocument();
  });

  it('opens the item named by defaultOpenId', () => {
    render(<FAQSection title="שאלות" items={items} defaultOpenId="a" />);

    expect(screen.getByText('תשובה ראשונה')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'שאלה ראשונה' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the previous answer when another opens, so the page does not grow unbounded', async () => {
    render(<FAQSection title="שאלות" items={items} defaultOpenId="a" />);

    fireEvent.click(screen.getByRole('button', { name: 'שאלה שלישית' }));

    // The collapsing panel unmounts only once its exit transition finishes.
    await waitFor(() => expect(screen.queryByText('תשובה ראשונה')).not.toBeInTheDocument());
    expect(screen.getByText('תשובה שלישית')).toBeInTheDocument();
  });

  it('keeps multiple answers open when allowMultiple is set', () => {
    render(<FAQSection title="שאלות" items={items} defaultOpenId="a" allowMultiple />);

    fireEvent.click(screen.getByRole('button', { name: 'שאלה שלישית' }));

    expect(screen.getByText('תשובה ראשונה')).toBeInTheDocument();
    expect(screen.getByText('תשובה שלישית')).toBeInTheDocument();
  });

  it('toggles an open item shut when its own header is pressed again', async () => {
    render(<FAQSection title="שאלות" items={items} defaultOpenId="a" />);

    const header = screen.getByRole('button', { name: 'שאלה ראשונה' });
    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByText('תשובה ראשונה')).not.toBeInTheDocument());
  });

  it('labels an unconfirmed answer instead of hiding that it is provisional', () => {
    render(<FAQSection title="שאלות" items={items} defaultOpenId="b" />);
    expect(screen.getByText('ממתין לאישור')).toBeInTheDocument();
  });

  it('moves focus between headers with the arrow keys', () => {
    render(<FAQSection title="שאלות" items={items} />);
    const first = screen.getByRole('button', { name: 'שאלה ראשונה' });
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'שאלה שנייה' }));

    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'שאלה שלישית' }));
  });
});
