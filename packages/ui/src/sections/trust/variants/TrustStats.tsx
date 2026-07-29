'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import type { TrustStripProps } from '../types';

/**
 * The claim set at display scale with its explanation beneath.
 *
 * Suits short factual titles — a founding year, a qualification, a count. A long
 * sentence set at this size stops reading as a statistic, which is why the title is
 * given a tight measure rather than allowed to run.
 */
export function TrustStats({ id, items, tone = 'surface', overlap = false, className }: TrustStripProps) {
  const inverse = tone === 'ink';
  return (
    <section
      id={id}
      aria-label="נתוני אמון ורקע מקצועי"
      className={cn(
        'relative py-14 desktop:py-16',
        overlap && '-mt-12 desktop:-mt-16',
        inverse ? 'bg-surface-inverse' : tone === 'alt' ? 'bg-surface-alt' : 'bg-surface',
        className,
      )}
    >
      <Container>
        <ul className="grid gap-x-10 gap-y-10 tablet:grid-cols-2 desktop:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 0.06}
              className={cn('border-t pt-6', inverse ? 'border-text-inverse/15' : 'border-border')}
            >
              {item.icon && (
                <item.icon size={24} aria-hidden="true" className={cn('mb-4', inverse ? 'text-accent' : 'text-brand-primary')} />
              )}
              <p
                data-edit-path={item.editPath}
                className={cn(
                  'max-w-[14ch] text-balance font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] desktop:text-4xl',
                  inverse ? 'text-text-inverse' : 'text-text-primary',
                )}
              >
                {item.title}
              </p>
              {item.description && (
                <p className={cn('mt-4 max-w-[32ch] font-body text-sm leading-relaxed', inverse ? 'text-text-inverse/65' : 'text-text-secondary')}>
                  {item.description}
                </p>
              )}
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
