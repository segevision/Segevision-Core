import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@segevision/utils';
import { Container } from './Container';

const sectionVariants = cva('w-full', {
  variants: {
    padding: {
      sm: 'py-12',
      md: 'py-20',
      lg: 'py-[7.5rem]',
    },
    background: {
      surface: 'bg-surface text-text-primary',
      'surface-alt': 'bg-surface-alt text-text-primary',
      inverse: 'bg-surface-inverse text-text-inverse',
      transparent: 'bg-transparent',
    },
  },
  defaultVariants: {
    padding: 'md',
    background: 'surface',
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
  /** Set false when the section supplies its own Container (rare — e.g. full-bleed media). */
  contained?: boolean;
}

/**
 * Every page section = container + vertical-padding token + optional background
 * variant, per Design System v1 Part 2 ("Sections"). Switching a section's visual
 * weight never requires custom CSS — only a prop.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ as: Comp = 'section', padding, background, contained = true, className, children, ...props }, ref) => (
    <Comp ref={ref} className={cn(sectionVariants({ padding, background }), className)} {...props}>
      {contained ? <Container>{children}</Container> : children}
    </Comp>
  ),
);
Section.displayName = 'Section';
