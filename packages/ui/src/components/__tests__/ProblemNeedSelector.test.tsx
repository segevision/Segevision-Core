import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProblemNeedSelector, type ProblemOption } from '../../sections/ProblemNeedSelector';
import { RTLProvider } from '../../providers/RTLProvider';

const options: ProblemOption[] = [
  { id: 'back', label: 'גב', headline: 'כאבי גב', description: 'תיאור גב' },
  { id: 'neck', label: 'צוואר', headline: 'כאבי צוואר', description: 'תיאור צוואר' },
  { id: 'knee', label: 'ברך', headline: 'כאבי ברך', description: 'תיאור ברך' },
];

function renderSelector(direction: 'rtl' | 'ltr' = 'rtl') {
  return render(
    <RTLProvider defaultDirection={direction} asChild>
      <ProblemNeedSelector title="איפה כואב?" options={options} disclaimer="הבהרה רפואית" />
    </RTLProvider>,
  );
}

describe('ProblemNeedSelector', () => {
  it('exposes a tablist with exactly one selected tab and a matching panel', () => {
    renderSelector();
    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(3);
    expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי גב');
  });

  it('uses a roving tabindex so the group is a single tab stop', () => {
    renderSelector();
    const tabs = screen.getAllByRole('tab');

    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
  });

  it('switches the panel when a chip is clicked', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('tab', { name: 'ברך' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי ברך');
    expect(screen.getByRole('tab', { name: 'ברך' })).toHaveAttribute('aria-selected', 'true');
  });

  it('maps ArrowLeft to "next" in RTL, where the next chip sits to the left', () => {
    renderSelector('rtl');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'גב' }), { key: 'ArrowLeft' });

    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי צוואר');
  });

  it('maps ArrowRight to "next" in LTR', () => {
    renderSelector('ltr');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'גב' }), { key: 'ArrowRight' });

    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי צוואר');
  });

  it('wraps around and supports Home/End', () => {
    renderSelector('rtl');
    // One step "backward" from the first chip lands on the last.
    fireEvent.keyDown(screen.getByRole('tab', { name: 'גב' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי ברך');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'ברך' }), { key: 'Home' });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי גב');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'גב' }), { key: 'End' });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('כאבי ברך');
  });

  it('always renders the medical disclaimer alongside the health information', () => {
    renderSelector();
    expect(screen.getByText('הבהרה רפואית')).toBeInTheDocument();
  });
});
