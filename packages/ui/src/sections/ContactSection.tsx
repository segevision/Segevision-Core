'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { IconProps } from '@segevision/icons';
import { Badge } from '../components/Badge';
import { Container } from '../components/Container';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export interface ContactChannel {
  id: string;
  icon?: React.ComponentType<IconProps>;
  label: string;
  value: string;
  href?: string;
  note?: string;
  /** Renders a visible "unconfirmed" chip instead of quietly shipping a guess. */
  pending?: boolean;
  pendingLabel?: string;
  editPath?: string;
}

export interface OpeningHoursRow {
  days: string;
  hours: string;
}

export interface ContactSectionProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  channels: ContactChannel[];
  hoursTitle?: string;
  hours?: OpeningHoursRow[];
  hoursNote?: string;
  /** Map embed or placeholder. Only pass a real map once the address is verified. */
  map?: React.ReactNode;
  className?: string;
}

export function ContactSection({
  id,
  eyebrow,
  title,
  lead,
  channels,
  hoursTitle,
  hours,
  hoursNote,
  map,
  className,
}: ContactSectionProps) {
  return (
    <section id={id} className={cn('bg-surface py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />

        <div className="mt-10 grid gap-6 desktop:grid-cols-12 desktop:gap-10">
          <Reveal className="desktop:col-span-5">
            <ul className="flex flex-col gap-px overflow-hidden rounded-md bg-border ring-1 ring-border">
              {channels.map((channel) => {
                const content = (
                  <>
                    {channel.icon && (
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary"
                      >
                        <channel.icon size={20} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-body text-xs font-semibold tracking-[0.03em] text-text-secondary">
                        {channel.label}
                      </span>
                      <span
                        data-edit-path={channel.editPath}
                        className="mt-1 block font-display text-lg font-bold leading-snug text-text-primary"
                      >
                        {channel.value}
                      </span>
                      {channel.note && (
                        <span className="mt-1 block font-body text-sm leading-relaxed text-text-secondary">
                          {channel.note}
                        </span>
                      )}
                      {channel.pending && (
                        <Badge variant="outline" className="mt-2">
                          {channel.pendingLabel ?? 'ממתין לאימות'}
                        </Badge>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={channel.id} className="bg-surface">
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="flex items-start gap-4 p-5 transition-colors duration-fast hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-start gap-4 p-5">{content}</div>
                    )}
                  </li>
                );
              })}

              {hours && hours.length > 0 && (
                <li className="bg-surface p-5">
                  {hoursTitle && (
                    <p className="font-body text-xs font-semibold tracking-[0.03em] text-text-secondary">
                      {hoursTitle}
                    </p>
                  )}
                  <dl className="mt-3 flex flex-col gap-2">
                    {hours.map((row) => (
                      <div key={row.days} className="flex items-baseline justify-between gap-4">
                        <dt className="font-body text-sm text-text-primary">{row.days}</dt>
                        <dd className="font-body text-sm font-semibold text-text-primary">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  {hoursNote && (
                    <p className="mt-3 font-body text-xs leading-relaxed text-text-secondary">{hoursNote}</p>
                  )}
                </li>
              )}
            </ul>
          </Reveal>

          {map && (
            <Reveal delay={0.06} className="desktop:col-span-7">
              {map}
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
