'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { ArrowIcon } from '@segevision/icons';
import { Container } from '../../../components/Container';
import { Reveal } from '../../../components/Reveal';
import { SectionHeading } from '../../../components/SectionHeading';
import type { ServiceGridProps } from '../types';

/** 7-5-5-7 tiling keeps every row full while giving two of four cards visual priority. */
const bentoSpan = ['desktop:col-span-7', 'desktop:col-span-5', 'desktop:col-span-5', 'desktop:col-span-7'];

export function ServicesGrid({ id, eyebrow, title, lead, items, editPaths, className }: ServiceGridProps) {
  return (
    <section id={id} className={cn('bg-surface py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} editPaths={editPaths} />
        <ul className="mt-10 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-12">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={Math.min(index, 3) * 0.06}
              className={cn('tablet:col-span-1', bentoSpan[index % bentoSpan.length])}
            >
              <article
                className={cn(
                  'group relative isolate flex h-full flex-col overflow-hidden rounded-md bg-surface p-7 desktop:p-8',
                  'ring-1 ring-border transition-[box-shadow,transform,border-color] duration-base ease-out',
                  'hover:-translate-y-0.5 hover:shadow-e3 hover:ring-brand-primary/40 motion-reduce:hover:translate-y-0',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-48 bg-[radial-gradient(60%_100%_at_50%_100%,hsl(var(--color-brand-primary)/0.10),transparent_70%)] opacity-0 transition-opacity duration-base group-hover:opacity-100"
                />
                {item.icon && (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-surface-inverse text-accent transition-colors duration-base group-hover:bg-brand-primary group-hover:text-text-inverse"
                  >
                    <item.icon size={24} />
                  </span>
                )}
                <h3
                  data-edit-path={item.editPaths?.title}
                  className="mt-6 font-display text-xl font-bold leading-snug tracking-[-0.01em] text-text-primary desktop:text-2xl"
                >
                  {item.title}
                </h3>
                <p
                  data-edit-path={item.editPaths?.description}
                  className="mt-3 max-w-[34rem] font-body text-base leading-relaxed text-text-secondary"
                >
                  {item.description}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-surface-alt px-3 py-1 font-body text-xs font-medium text-text-secondary">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                {item.action && (
                  <a
                    href={item.action.href}
                    className="mt-auto inline-flex items-center gap-2 pt-7 font-body text-sm font-semibold text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                  >
                    {item.action.label}
                    <ArrowIcon size={16} aria-hidden="true" className="rtl:-scale-x-100 transition-transform duration-fast group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
