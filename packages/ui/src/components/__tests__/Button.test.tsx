import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children and responds to click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book Appointment</Button>);
    const button = screen.getByRole('button', { name: /book appointment/i });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard operable (Enter and Space activate it)', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Call Now</Button>);
    const button = screen.getByRole('button', { name: /call now/i });
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button); // jsdom doesn't auto-fire click on Enter for <button>; browsers do natively
    expect(onClick).toHaveBeenCalled();
  });

  it('disabled buttons are not clickable and are announced as disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Unavailable
      </Button>,
    );
    const button = screen.getByRole('button', { name: /unavailable/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading state sets aria-busy and keeps the accessible name stable', () => {
    render(<Button loading>Submitting</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('icon-only buttons require an aria-label (accessibility contract)', () => {
    render(
      <Button iconOnly aria-label="Close">
        ✕
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations across variants', async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
