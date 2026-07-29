'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Seconds of delay before the reveal starts — used to stagger siblings. */
  delay?: number;
  /** Distance travelled, in px. Kept small on purpose: motion supports the copy, never performs. */
  distance?: number;
  as?: 'div' | 'li' | 'section' | 'article' | 'span';
}

/**
 * Scroll-triggered entrance for section content.
 *
 * Visible is the default state, and JavaScript only ever *removes* visibility from
 * elements that are currently below the fold. That ordering matters: it means a
 * failed hydration, a missing IntersectionObserver, or a crawler that runs no JS all
 * see a complete page, instead of a page of invisible content. The reverse default
 * (hidden until animated in) is the standard way scroll reveals silently break.
 *
 * Reduced motion is honoured before any of that, by never entering the hidden state
 * at all — so there is no transform, no fade, and no layout shift to opt out of.
 */
export const Reveal = React.forwardRef<HTMLElement, RevealProps>(
  ({ delay = 0, distance = 20, as: Comp = 'div', className, style, children, ...props }, forwardedRef) => {
    const elementRef = React.useRef<HTMLElement | null>(null);
    const [hidden, setHidden] = React.useState(false);

    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        elementRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    React.useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      if (typeof IntersectionObserver === 'undefined') return;
      if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Anything already on screen is left alone — animating it would mean hiding
      // content the visitor is currently looking at.
      if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

      setHidden(true);
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setHidden(false);
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
      );
      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    return (
      <Comp
        ref={setRefs as React.Ref<never>}
        className={cn(
          'transition-[opacity,transform] duration-slow ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none',
          hidden ? 'opacity-0' : 'translate-y-0 opacity-100',
          className,
        )}
        style={{
          ...style,
          transform: hidden ? `translateY(${distance}px)` : undefined,
          transitionDelay: hidden ? undefined : `${delay}s`,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Reveal.displayName = 'Reveal';
