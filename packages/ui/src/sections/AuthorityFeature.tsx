'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { CheckIcon } from '@segevision/icons';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Eyebrow } from '../components/Eyebrow';
import { Reveal } from '../components/Reveal';

export interface AuthorityFeatureProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  paragraphs: string[];
  points?: string[];
  /** Pull-quote or definition callout — one idea, never a wall of italics. */
  quote?: { text: string; attribution?: string };
  media?: React.ReactNode;
  /** Which side the media sits on at desktop width. Mobile always stacks media first. */
  mediaSide?: 'start' | 'end';
  action?: { label: string; href: string };
  /** Small print for sourcing/attribution — keeps a credibility claim honest. */
  note?: string;
  tone?: 'surface' | 'alt';
  className?: string;
}

/**
 * Long-form credibility block: one proof point, given enough room to actually land.
 * Deliberately not a card grid — an authority claim gains weight from space around
 * it, and loses it the moment it sits in a row of equals.
 */
export function AuthorityFeature({
  id,
  eyebrow,
  title,
  paragraphs,
  points,
  quote,
  media,
  mediaSide = 'start',
  action,
  note,
  tone = 'alt',
  className,
}: AuthorityFeatureProps) {
  return (
    <section
      id={id}
      className={cn('py-16 desktop:py-20', tone === 'alt' ? 'bg-surface-alt' : 'bg-surface', className)}
    >
      <Container>
        <div className="grid items-center gap-10 desktop:grid-cols-12 desktop:gap-16">
          {media && (
            <Reveal
              className={cn('desktop:col-span-5', mediaSide === 'end' ? 'desktop:order-2' : 'desktop:order-1')}
            >
              {media}
            </Reveal>
          )}

          <Reveal
            delay={0.06}
            className={cn(
              media ? 'desktop:col-span-7' : 'desktop:col-span-9',
              mediaSide === 'end' ? 'desktop:order-1' : 'desktop:order-2',
            )}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.12] tracking-[-0.02em] text-text-primary desktop:text-5xl">
              {title}
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[38rem] font-body text-base leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>

            {quote && (
              <blockquote className="mt-8 border-s-2 border-accent ps-5">
                <p className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-text-primary">
                  {quote.text}
                </p>
                {quote.attribution && (
                  <footer className="mt-2 font-body text-sm text-text-secondary">{quote.attribution}</footer>
                )}
              </blockquote>
            )}

            {points && points.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {points.map((point) => (
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

            {action && (
              <Button asChild size="lg" variant="secondary" className="mt-8 w-full tablet:w-auto">
                <a href={action.href}>{action.label}</a>
              </Button>
            )}

            {note && <p className="mt-6 font-body text-xs leading-relaxed text-text-secondary">{note}</p>}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
