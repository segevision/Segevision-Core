'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import type { TrustStripProps } from '../types';

/**
 * A restrained vertical list, closer to a colophon than a marketing band.
 *
 * This is the variant for practices whose credibility is documentary — licences,
 * memberships, training. Shouting them at statistic scale would undercut them, so the
 * type stays small and the space around each line does the work.
 */
export function TrustCredentials({ id, items, tone = 'alt', overlap = false, className }: TrustStripProps) {
  const inverse = tone === 'ink';
  return (
    <section
      id={id}
      aria-label="נתוני אמון ורקע מקצועי"
      className={cn(
        'relative py-14 desktop:py-16',
        overlap && '-mt-12 desktop:-mt-16',
        inverse ? 'bg-surface-inverse' : tone === 'surface' ? 'bg-surface' : 'bg-surface-alt',
        className,
      )}
    >
      <Container>
        <ul className="mx-auto flex max-w-[46rem] flex-col">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 0.05}
              className={cn('flex items-baseline gap-5 border-b py-5 last:border-b-0', inverse ? 'border-text-inverse/12' : 'border-border')}
            >
              <span className={cn('font-body text-xs tabular-nums', inverse ? 'text-text-inverse/40' : 'text-text-secondary/60')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  data-edit-path={item.editPath}
                  className={cn('font-display text-lg font-bold leading-snug', inverse ? 'text-text-inverse' : 'text-text-primary')}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className={cn('mt-1 font-body text-sm leading-relaxed', inverse ? 'text-text-inverse/65' : 'text-text-secondary')}>
                    {item.description}
                  </p>
                )}
              </div>
              {item.icon && (
                <item.icon size={20} aria-hidden="true" className={cn('shrink-0', inverse ? 'text-accent' : 'text-brand-primary')} />
              )}
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
