import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../providers/ThemeProvider';
import { RTLProvider } from '../../providers/RTLProvider';
import { useDirection } from '@segevision/hooks';

function ThemeConsumer() {
  const { theme, mode, toggleMode } = useTheme();
  return (
    <button onClick={toggleMode}>
      {theme}-{mode}
    </button>
  );
}

function DirectionConsumer() {
  const { direction, setDirection } = useDirection();
  return <button onClick={() => setDirection(direction === 'rtl' ? 'ltr' : 'rtl')}>{direction}</button>;
}

describe('ThemeProvider', () => {
  it('provides a default theme/mode and toggles mode', () => {
    render(
      <ThemeProvider defaultTheme="medical" defaultMode="light" asChild>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('medical-light');
    fireEvent.click(button);
    expect(button).toHaveTextContent('medical-dark');
  });
});

describe('RTLProvider', () => {
  it('defaults to rtl and can switch to ltr', () => {
    render(
      <RTLProvider defaultDirection="rtl" asChild>
        <DirectionConsumer />
      </RTLProvider>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('rtl');
    fireEvent.click(button);
    expect(button).toHaveTextContent('ltr');
  });
});
