'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { IconProps } from '@segevision/icons';
import { Container } from '../components/Container';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<IconProps>;
}

export interface FeatureGridProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  tone?: 'surface' | 'alt' | 'ink';
  className?: string;
}

const columnMap: Record<NonNullable<FeatureGridProps['columns']>, string> = {
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-2 desktop:grid-cols-3',
  4: 'tablet:grid-cols-2 desktop:grid-cols-4',
};

/**
 * Differentiator list. Rendered as ruled columns rather than cards: these are
 * reasons to trust, not products to compare, and boxing each one would inflate
 * four honest sentences into four sales units.
 */
export function FeatureGrid({
  id,
  eyebrow,
  title,
  lead,
  items,
  columns = 4,
  tone = 'surface',
  className,
}: FeatureGridProps) {
  const inverse = tone === 'ink';
  return (
    <section
      id={id}
      className={cn(
        'py-16 desktop:py-20',
        inverse ? 'bg-surface-inverse' : tone === 'alt' ? 'bg-surface-alt' : 'bg-surface',
        className,
      )}
    >
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} tone={inverse ? 'inverse' : 'default'} />

        <ul className={cn('mt-12 grid gap-x-8 gap-y-10', columnMap[columns])}>
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={Math.min(index, 3) * 0.06}
              className={cn('border-t pt-6', inverse ? 'border-text-inverse/15' : 'border-border')}
            >
              {item.icon && (
                <item.icon
                  size={24}
                  aria-hidden="true"
                  className={inverse ? 'text-accent' : 'text-brand-primary'}
                />
              )}
              <h3
                className={cn(
                  'mt-4 font-display text-lg font-bold leading-snug tracking-[-0.01em]',
                  inverse ? 'text-text-inverse' : 'text-text-primary',
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  'mt-2.5 font-body text-sm leading-relaxed',
                  inverse ? 'text-text-inverse/65' : 'text-text-secondary',
                )}
              >
                {item.description}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
