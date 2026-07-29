'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { IconProps } from '@segevision/icons';

export interface MobileContactAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
  /** One action per bar should be the primary conversion — it gets the filled treatment. */
  emphasis?: boolean;
  ariaLabel?: string;
}

export interface MobileContactBarProps {
  actions: MobileContactAction[];
  /** Scroll distance in px before the bar appears — keeps it out of the hero. */
  revealAfter?: number;
  label?: string;
  className?: string;
}

/**
 * Persistent mobile conversion bar. It appears only after the visitor has scrolled
 * past the hero (where the same CTAs are already on screen at full size), sits above
 * the iOS home indicator via safe-area insets, and every target clears 44px.
 */
export function MobileContactBar({
  actions,
  revealAfter = 480,
  label = 'פעולות יצירת קשר מהירות',
  className,
}: MobileContactBarProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > revealAfter);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [revealAfter]);

  return (
    <nav
      aria-label={label}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl tablet:hidden',
        'transition-transform duration-base ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0' : 'translate-y-full',
        className,
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-3 gap-2 p-2">
        {actions.map((action) => (
          <li key={action.id}>
            <a
              href={action.href}
              aria-label={action.ariaLabel ?? action.label}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 rounded-md font-body text-xs font-semibold',
                'transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                action.emphasis
                  ? 'bg-action text-text-inverse hover:bg-action-hover'
                  : 'bg-surface-alt text-text-primary hover:bg-border/60',
              )}
            >
              <action.icon size={20} aria-hidden="true" />
              {action.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
