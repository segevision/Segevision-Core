'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../components/Container';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  /** Optional short outcome line — what the visitor actually leaves this step with. */
  outcome?: string;
}

export interface ProcessTimelineProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  steps: ProcessStep[];
  tone?: 'ink' | 'surface';
  /** Rendered under the timeline — typically the appointment CTA. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Ordered process, rendered as a real <ol> so the sequence survives without CSS.
 * Shown on the ink surface because a numbered path is the one moment in the page
 * where we want the visitor to slow down and read linearly — a darker field
 * removes the surrounding competition for attention.
 */
export function ProcessTimeline({
  id,
  eyebrow,
  title,
  lead,
  steps,
  tone = 'ink',
  footer,
  className,
}: ProcessTimelineProps) {
  const inverse = tone === 'ink';

  return (
    <section
      id={id}
      className={cn(
        'relative isolate overflow-hidden py-16 desktop:py-20',
        inverse ? 'bg-surface-inverse' : 'bg-surface-alt',
        className,
      )}
    >
      {inverse && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_15%_0%,hsl(var(--color-brand-primary)/0.35),transparent_60%)]"
        />
      )}

      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} tone={inverse ? 'inverse' : 'default'} />

        <ol className="relative mt-10 grid gap-8 desktop:grid-cols-5 desktop:gap-6">
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-x-6 top-6 hidden h-px desktop:block',
              inverse ? 'bg-text-inverse/15' : 'bg-border',
            )}
          />

          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.id}
              delay={index * 0.07}
              className="relative ps-16 desktop:ps-0"
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-0 start-6 top-14 w-px -translate-x-1/2 rtl:translate-x-1/2 desktop:hidden',
                    inverse ? 'bg-text-inverse/15' : 'bg-border',
                  )}
                />
              )}

              <span
                aria-hidden="true"
                className={cn(
                  'absolute start-0 top-0 inline-flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-extrabold desktop:relative desktop:h-12 desktop:w-12',
                  inverse
                    ? 'bg-surface-inverse text-accent ring-1 ring-accent/50'
                    : 'bg-surface text-brand-primary ring-1 ring-border',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3
                className={cn(
                  'font-display text-lg font-bold leading-snug tracking-[-0.01em] desktop:mt-6',
                  inverse ? 'text-text-inverse' : 'text-text-primary',
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  'mt-2.5 font-body text-sm leading-relaxed',
                  inverse ? 'text-text-inverse/65' : 'text-text-secondary',
                )}
              >
                {step.description}
              </p>
              {step.outcome && (
                <p
                  className={cn(
                    'mt-3 border-s-2 ps-3 font-body text-sm font-medium leading-relaxed',
                    inverse ? 'border-accent/60 text-text-inverse/85' : 'border-brand-primary/50 text-text-primary',
                  )}
                >
                  {step.outcome}
                </p>
              )}
            </Reveal>
          ))}
        </ol>

        {footer && <div className="mt-12">{footer}</div>}
      </Container>
    </section>
  );
}
