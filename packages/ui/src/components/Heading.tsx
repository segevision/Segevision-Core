import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

/**
 * `level` controls the semantic tag (h1-h6, never skipped — accessibility rule).
 * `size` controls the visual scale independently, so a visually-small H1 (rare but
 * valid for a sub-hero) never has to lie about its semantic level to get the right look.
 */
const headingVariants = cva('font-display font-bold text-text-primary', {
  variants: {
    size: {
      '2xl': 'text-2xl leading-snug',
      '3xl': 'text-3xl leading-snug',
      '4xl': 'text-4xl leading-tight',
      '5xl': 'text-5xl leading-tight',
      '6xl': 'text-6xl leading-tight',
      '7xl': 'text-7xl leading-tight',
    },
  },
  defaultVariants: {
    size: '4xl',
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const defaultSizeForLevel: Record<number, VariantProps<typeof headingVariants>['size']> = {
  1: '6xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: '2xl',
  6: '2xl',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size, className, ...props }, ref) => {
    const Comp = `h${level}` as React.ElementType;
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size: size ?? defaultSizeForLevel[level] }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';
