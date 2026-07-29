import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

const gridVariants = cva('grid', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 tablet:grid-cols-2',
      3: 'grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3',
      4: 'grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4',
      12: 'grid-cols-12',
    },
    gap: {
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    },
  },
  defaultVariants: {
    columns: 3,
    gap: 6,
  },
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {
  as?: React.ElementType;
}

/**
 * 12-column grid system from Design System v1, Part 2 — the `columns` prop maps to
 * the responsive collapse pattern used across every card/service/team grid (mobile
 * 1-col -> tablet 2-col -> desktop N-col), so no page ever hand-writes breakpoints.
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ as: Comp = 'div', columns, gap, className, ...props }, ref) => (
    <Comp ref={ref} className={cn(gridVariants({ columns, gap }), className)} {...props} />
  ),
);
Grid.displayName = 'Grid';
