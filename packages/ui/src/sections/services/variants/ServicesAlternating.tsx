'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { ArrowIcon } from '@segevision/icons';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import { SectionHeading } from '../../../components/SectionHeading';
import type { ServiceGridProps } from '../types';

/**
 * Wide rows whose emphasis alternates side to side. The zig-zag gives a long list a
 * reading rhythm that a uniform grid cannot, and it holds up when descriptions differ
 * a lot in length — the case where a grid starts looking ragged.
 */
export function ServicesAlternating({ id, eyebrow, title, lead, items, editPaths, className }: ServiceGridProps) {
  return (
    <section id={id} className={cn('bg-surface-alt py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} editPaths={editPaths} />
        <ul className="mt-10 flex flex-col gap-4">
          {items.map((item, index) => {
            const flipped = index % 2 === 1;
            return (
              <Reveal as="li" key={item.id} delay={Math.min(index, 4) * 0.05}>
                <article
                  className={cn(
                    'group grid items-center gap-6 rounded-md bg-surface p-7 ring-1 ring-border transition-shadow duration-base hover:shadow-e2 desktop:grid-cols-12 desktop:gap-10 desktop:p-9',
                  )}
                >
                  <div className={cn('flex items-center gap-5 desktop:col-span-5', flipped && 'desktop:order-2')}>
                    {item.icon && (
                      <span
                        aria-hidden="true"
                        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary"
                      >
                        <item.icon size={24} />
                      </span>
                    )}
                    <h3
                      data-edit-path={item.editPaths?.title}
                      className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-text-primary"
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className={cn('desktop:col-span-7', flipped && 'desktop:order-1')}>
                    <p
                      data-edit-path={item.editPaths?.description}
                      className="font-body text-base leading-relaxed text-text-secondary"
                    >
                      {item.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                      {item.tags?.map((tag) => (
                        <span key={tag} className="font-body text-xs text-text-secondary/80">
                          {tag}
                        </span>
                      ))}
                      {item.action && (
                        <a
                          href={item.action.href}
                          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                        >
                          {item.action.label}
                          <ArrowIcon size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
