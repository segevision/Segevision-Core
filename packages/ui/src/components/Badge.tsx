import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-body font-semibold leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        solid: 'bg-brand-primary text-text-inverse',
        soft: 'bg-brand-primary/10 text-brand-primary',
        outline: 'ring-1 ring-inset ring-border text-text-secondary',
        accent: 'bg-accent/15 text-text-primary ring-1 ring-inset ring-accent/40',
        inverse: 'bg-text-inverse/10 text-text-inverse ring-1 ring-inset ring-text-inverse/20',
      },
      size: {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: { variant: 'soft', size: 'sm' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/** Compact status/label chip. Never interactive — use Button for anything clickable. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, size, className, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { badgeVariants };
