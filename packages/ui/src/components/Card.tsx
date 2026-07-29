import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';

const cardVariants = cva(
  'rounded-lg bg-surface p-6 shadow-e1 transition-[transform,box-shadow] duration-fast ease-out',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        false: '',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      interactive: false,
      padding: 'md',
    },
  },
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

/**
 * Base card primitive underlying Service/Team/Testimonial/Pricing cards (Website
 * Factory Architecture, Part 1). `interactive` adds the elevation-1 -> elevation-2
 * hover step from Design System v1 Part 2; non-interactive cards never get hover feedback.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ as: Comp = 'div', interactive, padding, className, ...props }, ref) => (
    <Comp ref={ref} className={cn(cardVariants({ interactive, padding }), className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />,
);
CardBody.displayName = 'CardBody';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 flex items-center gap-3', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
