import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

const textVariants = cva('font-body', {
  variants: {
    size: {
      xs: 'text-xs leading-normal',
      sm: 'text-sm leading-normal',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-relaxed',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      inverse: 'text-text-inverse',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'base',
    color: 'primary',
    weight: 'regular',
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

/** Body-copy primitive. Line length/line-height pairing per Design System v1 Typography Principles. */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ as: Comp = 'p', size, color, weight, className, ...props }, ref) => (
    <Comp ref={ref} className={cn(textVariants({ size, color, weight }), className)} {...props} />
  ),
);
Text.displayName = 'Text';
