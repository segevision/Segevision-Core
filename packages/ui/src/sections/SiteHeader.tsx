'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { CloseIcon, MenuIcon, type IconProps } from '@segevision/icons';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Logo } from '../components/Logo';

export interface NavItem {
  label: string;
  /** In-page anchors ("#services") also drive the active-section indicator. */
  href: string;
}

export interface HeaderAction {
  label: string;
  href: string;
  icon?: React.ComponentType<IconProps>;
  /** Announced instead of the visible label when the label alone is ambiguous. */
  ariaLabel?: string;
}

export interface SiteHeaderProps {
  brand: { name: string; src?: string; href?: string; tagline?: string };
  items: NavItem[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  /** Over a dark hero the header starts transparent with light text, then solidifies on scroll. */
  overlay?: boolean;
  /** Accessible label for the mobile menu toggle. */
  menuLabel?: string;
  closeLabel?: string;
  className?: string;
}

const SCROLL_THRESHOLD = 24;

/**
 * Sticky site header with an active-section indicator and a full-screen mobile
 * drawer. The drawer traps focus, closes on Escape or on navigation, restores
 * focus to the toggle, and locks background scroll — all requirements for a
 * navigation surface that is also the primary conversion path on mobile.
 */
export function SiteHeader({
  brand,
  items,
  primaryAction,
  secondaryAction,
  overlay = false,
  menuLabel = 'פתיחת תפריט',
  closeLabel = 'סגירת תפריט',
  className,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-section indicator: the anchor closest to the top of the viewport wins.
  React.useEffect(() => {
    const ids = items.map((item) => item.href).filter((href) => href.startsWith('#')).map((href) => href.slice(1));
    if (ids.length === 0) return;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const firstLink = panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
    firstLink?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const solid = scrolled || !overlay;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-base ease-out',
        solid
          ? 'bg-surface/85 shadow-[0_1px_0_0_hsl(var(--color-border-default)/0.7)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent',
        className,
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:font-semibold focus:text-text-primary focus:ring-2 focus:ring-border-focus"
      >
        דילוג לתוכן הראשי
      </a>
      <Container>
        <div className={cn('flex items-center justify-between gap-6 transition-[height] duration-base ease-out', solid ? 'h-16 desktop:h-[4.5rem]' : 'h-20 desktop:h-24')}>
          <a
            href={brand.href ?? '#'}
            className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
          >
            <Logo
              name={brand.name}
              src={brand.src}
              size="md"
              className={cn('tracking-[-0.02em] transition-colors', solid ? 'text-text-primary' : 'text-text-inverse')}
            />
            {brand.tagline && (
              <span
                className={cn(
                  'hidden border-s ps-3 font-body text-xs leading-tight desktop:block',
                  solid ? 'border-border text-text-secondary' : 'border-text-inverse/25 text-text-inverse/70',
                )}
              >
                {brand.tagline}
              </span>
            )}
          </a>

          <nav aria-label="ניווט ראשי" className="hidden desktop:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const isActive = item.href === `#${activeId}`;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative rounded-md px-3 py-2 font-body text-sm font-medium transition-colors duration-fast',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                        solid
                          ? isActive
                            ? 'text-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                          : isActive
                            ? 'text-text-inverse'
                            : 'text-text-inverse/75 hover:text-text-inverse',
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent transition-[opacity,transform] duration-base ease-out',
                          isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
                        )}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {secondaryAction && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn('hidden desktop:inline-flex', !solid && 'text-text-inverse hover:bg-text-inverse/10')}
              >
                <a href={secondaryAction.href} aria-label={secondaryAction.ariaLabel}>
                  {secondaryAction.icon && <secondaryAction.icon size={20} aria-hidden="true" />}
                  {secondaryAction.label}
                </a>
              </Button>
            )}
            {primaryAction && (
              <Button asChild size="sm" className="hidden tablet:inline-flex">
                <a href={primaryAction.href} aria-label={primaryAction.ariaLabel}>
                  {primaryAction.label}
                </a>
              </Button>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={menuLabel}
              aria-expanded={open}
              aria-controls="site-menu"
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors desktop:hidden',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                solid ? 'text-text-primary hover:bg-surface-alt' : 'text-text-inverse hover:bg-text-inverse/10',
              )}
            >
              <MenuIcon size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="fixed inset-0 z-50 desktop:hidden">
          <div
            className="absolute inset-0 bg-surface-inverse/60 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="תפריט האתר"
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto rounded-b-md bg-surface p-6 shadow-e4"
          >
            <div className="flex items-center justify-between">
              <Logo name={brand.name} src={brand.src} size="md" />
              <button
                type="button"
                onClick={closeMenu}
                aria-label={closeLabel}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-primary hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <CloseIcon size={24} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="ניווט ראשי בנייד" className="mt-6">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.href} className="border-b border-border last:border-0">
                    <a
                      href={item.href}
                      onClick={closeMenu}
                      className="block py-4 font-display text-xl font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              {primaryAction && (
                <Button asChild size="lg" className="w-full">
                  <a href={primaryAction.href} onClick={closeMenu}>
                    {primaryAction.label}
                  </a>
                </Button>
              )}
              {secondaryAction && (
                <Button asChild variant="secondary" size="lg" className="w-full">
                  <a href={secondaryAction.href} onClick={closeMenu} aria-label={secondaryAction.ariaLabel}>
                    {secondaryAction.icon && <secondaryAction.icon size={20} aria-hidden="true" />}
                    {secondaryAction.label}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
