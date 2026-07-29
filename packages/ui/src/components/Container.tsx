import * as React from 'react';
import { cn } from '@segevision/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

/**
 * Grid-constrained wrapper — Design System v1 grid system (max-width 1280px,
 * responsive side padding). Content never breaks this; full-bleed backgrounds
 * (applied by a parent Section) are allowed to.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Comp = 'div', className, ...props }, ref) => (
    <Comp ref={ref} className={cn('mx-auto w-full max-w-[1280px] px-4 tablet:px-6', className)} {...props} />
  ),
);
Container.displayName = 'Container';
