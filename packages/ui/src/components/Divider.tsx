import * as React from 'react';
import { cn } from '@segevision/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Optional inline label, e.g. "or" — centered within the line. */
  label?: React.ReactNode;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', label, className, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation={orientation}
          className={cn('flex items-center gap-4 text-text-secondary text-sm', className)}
          {...props}
        >
          <span className="h-px flex-1 bg-border" />
          {label}
          <span className="h-px flex-1 bg-border" />
        </div>
      );
    }
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          'bg-border',
          className,
        )}
        {...props}
      />
    );
  },
);
Divider.displayName = 'Divider';
