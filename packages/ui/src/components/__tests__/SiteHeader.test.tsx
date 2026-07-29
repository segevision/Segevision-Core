import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SiteHeader, type NavItem } from '../../sections/SiteHeader';

const items: NavItem[] = [
  { label: 'שירותים', href: '#services' },
  { label: 'הצוות', href: '#team' },
];

function renderHeader() {
  return render(
    <SiteHeader
      brand={{ name: 'שם הלקוח' }}
      items={items}
      primaryAction={{ label: 'לקביעת תור', href: '#appointment' }}
    />,
  );
}

describe('SiteHeader', () => {
  it('always offers a skip link as the first focusable element', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'דילוג לתוכן הראשי' })).toHaveAttribute('href', '#main');
  });

  it('reports the drawer state on the toggle', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'פתיחת תפריט' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'תפריט האתר' })).toBeInTheDocument();
  });

  it('closes the drawer on Escape and restores focus to the toggle', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'פתיחת תפריט' });
    fireEvent.click(toggle);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the drawer when a navigation link is followed', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט' }));

    const drawer = screen.getByRole('dialog', { name: 'תפריט האתר' });
    fireEvent.click(within(drawer, 'שירותים'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('locks background scrolling while the drawer is open', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט' }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: 'סגירת תפריט' }));
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

/** Scopes a link lookup to the drawer, since each nav item also exists in the desktop nav. */
function within(container: HTMLElement, name: string): HTMLElement {
  const link = Array.from(container.querySelectorAll('a')).find((node) => node.textContent === name);
  if (!link) throw new Error(`No link named "${name}" inside the drawer`);
  return link;
}
