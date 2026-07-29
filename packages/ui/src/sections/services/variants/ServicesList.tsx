'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { ArrowIcon } from '@segevision/icons';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import { SectionHeading } from '../../../components/SectionHeading';
import type { ServiceGridProps } from '../types';

/**
 * Numbered editorial rows with no boxes at all. Cards imply comparable products;
 * a ruled list implies a considered sequence, which suits practices that offer a
 * small number of related services rather than a catalogue.
 */
export function ServicesList({ id, eyebrow, title, lead, items, editPaths, className }: ServiceGridProps) {
  return (
    <section id={id} className={cn('bg-surface py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} editPaths={editPaths} />
        <ol className="mt-10 border-t border-border">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={Math.min(index, 4) * 0.05}
              className="group border-b border-border"
            >
              <div className="grid gap-x-8 gap-y-3 py-7 desktop:grid-cols-12 desktop:py-9">
                <div className="flex items-baseline gap-4 desktop:col-span-5">
                  <span className="font-body text-sm tabular-nums text-text-secondary/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3
                    data-edit-path={item.editPaths?.title}
                    className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-text-primary desktop:text-3xl"
                  >
                    {item.title}
                  </h3>
                </div>
                <div className="desktop:col-span-5">
                  <p
                    data-edit-path={item.editPaths?.description}
                    className="max-w-[36rem] font-body text-base leading-relaxed text-text-secondary"
                  >
                    {item.description}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {item.tags.map((tag) => (
                        <li key={tag} className="font-body text-xs text-text-secondary/80">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {item.action && (
                  <div className="desktop:col-span-2 desktop:text-end">
                    <a
                      href={item.action.href}
                      className="inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                    >
                      {item.action.label}
                      <ArrowIcon size={16} aria-hidden="true" className="rtl:-scale-x-100 transition-transform duration-fast group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
