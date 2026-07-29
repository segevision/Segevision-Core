import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

/**
 * Design System v1, Part 2 & 3: radius-md default, height tokens sm/md/lg (md = 44px,
 * the WCAG touch-target minimum, so it is the safe default everywhere). Variants are
 * independent of size — e.g. "lg + ghost" and "sm + primary" are both valid.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded font-body font-semibold',
    'transition-[transform,box-shadow,background-color,color,border-color] duration-fast ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-action text-text-inverse shadow-e1 hover:bg-action-hover hover:shadow-e2',
        secondary:
          'bg-surface-alt text-text-primary border border-border hover:border-brand-primary',
        ghost: 'bg-transparent text-text-primary hover:bg-surface-alt',
        danger: 'bg-danger text-text-inverse hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-[3.25rem] px-7 text-lg',
      },
      iconOnly: {
        true: 'aspect-square px-0',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Required when iconOnly is true — enforced accessibility (Design System v1, Part 6). */
  'aria-label'?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, iconOnly, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            <span className="sr-only">Loading</span>
            {!iconOnly && children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
