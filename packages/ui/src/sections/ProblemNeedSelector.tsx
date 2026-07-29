'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { useDirection } from '@segevision/hooks';
import { AlertIcon, CheckIcon, type IconProps } from '@segevision/icons';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export interface ProblemOption {
  id: string;
  /** Chip label — one or two words, phrased the way a patient would say it. */
  label: string;
  icon?: React.ComponentType<IconProps>;
  headline: string;
  description: string;
  /** What the visitor can expect. Keep to claims the clinic can stand behind. */
  points?: string[];
  action?: { label: string; href: string };
  /** Optional visual for the panel — an illustration, photo or placeholder. */
  media?: React.ReactNode;
}

export interface ProblemNeedSelectorProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  options: ProblemOption[];
  defaultOptionId?: string;
  /** Medical disclaimer — required whenever health information is shown. */
  disclaimer?: string;
  className?: string;
}

/**
 * Symptom-first entry point. Visitors arriving at a clinic site are not shopping for
 * services, they are trying to place their own problem — so the first interaction we
 * offer is "where does it hurt", not "browse our treatments". Implemented as a proper
 * ARIA tablist with automatic activation and roving tabindex, so keyboard and screen
 * reader users get the same one-step path to the appointment CTA.
 */
export function ProblemNeedSelector({
  id,
  eyebrow,
  title,
  lead,
  options,
  defaultOptionId,
  disclaimer,
  className,
}: ProblemNeedSelectorProps) {
  const { direction } = useDirection();
  const [activeId, setActiveId] = React.useState(defaultOptionId ?? options[0]?.id);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === activeId),
  );
  const active = options[activeIndex];

  const focusTab = (index: number) => {
    const next = options[(index + options.length) % options.length];
    if (!next) return;
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // In RTL the visual "next" chip sits to the left, so the arrow mapping flips.
    const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    switch (event.key) {
      case forward:
      case 'ArrowDown':
        event.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case backward:
      case 'ArrowUp':
        event.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(options.length - 1);
        break;
      default:
        break;
    }
  };

  if (!active) return null;

  return (
    <section id={id} className={cn('bg-surface-alt py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />

        <Reveal delay={0.05} className="mt-10">
          <div role="tablist" aria-label="בחירת אזור הכאב" className="flex flex-wrap gap-2.5">
            {options.map((option) => {
              const selected = option.id === active.id;
              return (
                <button
                  key={option.id}
                  ref={(node) => {
                    tabRefs.current[option.id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`pain-tab-${option.id}`}
                  aria-selected={selected}
                  aria-controls={`pain-panel-${option.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(option.id)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-5 py-3 font-body text-base font-semibold',
                    'transition-[background-color,color,box-shadow,border-color] duration-fast ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt',
                    selected
                      ? 'bg-surface-inverse text-text-inverse shadow-e2'
                      : 'bg-surface text-text-secondary ring-1 ring-inset ring-border hover:text-text-primary hover:ring-text-secondary/40',
                  )}
                >
                  {option.icon && (
                    <option.icon size={20} aria-hidden="true" className={selected ? 'text-accent' : undefined} />
                  )}
                  {option.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id={`pain-panel-${active.id}`}
          aria-labelledby={`pain-tab-${active.id}`}
          tabIndex={0}
          className="mt-6 rounded-md bg-surface p-7 shadow-e2 ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus desktop:p-10"
        >
          <div key={active.id} className="grid gap-8 desktop:grid-cols-12 desktop:gap-12">
            <div className={cn(active.media ? 'desktop:col-span-7' : 'desktop:col-span-9')}>
              <h3 className="font-display text-2xl font-bold leading-snug tracking-[-0.01em] text-text-primary desktop:text-3xl">
                {active.headline}
              </h3>
              <p className="mt-4 max-w-[36rem] font-body text-base leading-relaxed text-text-secondary">
                {active.description}
              </p>

              {active.points && active.points.length > 0 && (
                <ul className="mt-6 flex flex-col gap-3">
                  {active.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                      >
                        <CheckIcon size={16} />
                      </span>
                      <span className="font-body text-base leading-relaxed text-text-primary">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {active.action && (
                <Button asChild size="lg" className="mt-8 w-full tablet:w-auto">
                  <a href={active.action.href}>{active.action.label}</a>
                </Button>
              )}
            </div>

            {active.media && <div className="desktop:col-span-5">{active.media}</div>}
          </div>

          {disclaimer && (
            <p className="mt-8 flex items-start gap-2.5 border-t border-border pt-6 font-body text-sm leading-relaxed text-text-secondary">
              <AlertIcon size={16} aria-hidden="true" className="mt-1 shrink-0" />
              <span>{disclaimer}</span>
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
