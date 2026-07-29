import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    gap: {
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'column',
    gap: 4,
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType;
}

/**
 * Base layout primitive underlying most component internals (Card content,
 * form field groups, button groups). `direction: row` automatically respects
 * the ambient `dir` (logical flex — no RTL-specific override needed).
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ as: Comp = 'div', direction, gap, align, justify, wrap, className, ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(stackVariants({ direction, gap, align, justify, wrap }), className)}
      {...props}
    />
  ),
);
Stack.displayName = 'Stack';
