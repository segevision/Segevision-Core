import * as React from 'react';
import { cn } from '@segevision/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'inverse' | 'muted';
  /** Leading rule reads as a typographic anchor and orients the eye in both RTL and LTR. */
  withRule?: boolean;
}

const toneMap: Record<NonNullable<EyebrowProps['tone']>, string> = {
  accent: 'text-brand-primary',
  inverse: 'text-text-inverse/70',
  muted: 'text-text-secondary',
};

const ruleToneMap: Record<NonNullable<EyebrowProps['tone']>, string> = {
  accent: 'bg-accent',
  inverse: 'bg-accent',
  muted: 'bg-border',
};

/**
 * Small label above a section title. Uppercase is avoided because Hebrew has no
 * case — the emphasis comes from weight, letter-spacing and the accent rule instead.
 */
export const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ tone = 'accent', withRule = true, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 font-body text-sm font-semibold tracking-[0.04em]',
        toneMap[tone],
        className,
      )}
      {...props}
    >
      {withRule && <span aria-hidden="true" className={cn('h-px w-6 rounded-full', ruleToneMap[tone])} />}
      {children}
    </span>
  ),
);
Eyebrow.displayName = 'Eyebrow';
