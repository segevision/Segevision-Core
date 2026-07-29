'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import type { TrustStripProps } from '../types';

/** Credibility band placed directly under the hero, where scepticism peaks. */
export function TrustStripRow({ id, items, tone = 'surface', overlap = false, className }: TrustStripProps) {
  const inverse = tone === 'ink';
  return (
    <section id={id} aria-label="נתוני אמון ורקע מקצועי" className={cn('relative', overlap && '-mt-12 desktop:-mt-16', className)}>
      <Container>
        <Reveal>
          <ul
            className={cn(
              'grid gap-px overflow-hidden rounded-md tablet:grid-cols-2 desktop:grid-cols-3',
              inverse ? 'bg-text-inverse/10 shadow-e3 ring-1 ring-text-inverse/10' : 'bg-border shadow-e2 ring-1 ring-border',
            )}
          >
            {items.map((item) => (
              <li
                key={item.title}
                className={cn('flex items-start gap-4 p-6 desktop:p-7', inverse ? 'bg-surface-inverse' : tone === 'alt' ? 'bg-surface-alt' : 'bg-surface')}
              >
                {item.icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                      inverse ? 'bg-accent/15 text-accent' : 'bg-brand-primary/10 text-brand-primary',
                    )}
                  >
                    <item.icon size={20} />
                  </span>
                )}
                <div className="min-w-0">
                  <p
                    data-edit-path={item.editPath}
                    className={cn('font-display text-base font-bold leading-snug', inverse ? 'text-text-inverse' : 'text-text-primary')}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className={cn('mt-1.5 font-body text-sm leading-relaxed', inverse ? 'text-text-inverse/65' : 'text-text-secondary')}>
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
