'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../../../components/Container';
import { Eyebrow } from '../../../components/Eyebrow';
import { Reveal } from '../../../components/Reveal';
import { Text } from '../../../components/Text';
import { HeroActions, HeroCredentials, HeroTitle, toneClasses } from '../shared';
import type { HeroSectionProps } from '../types';

/**
 * Full-bleed image with the type sitting on it, letterboxed to a filmic proportion.
 * The gradient scrim is doubled — one wide, one tight at the base — because a single
 * flat overlay greys the photograph out instead of protecting the text.
 */
export function HeroCinematic({
  id,
  eyebrow,
  titleLines,
  lead,
  actions = [],
  credentials = [],
  media,
  editPaths,
  className,
}: HeroSectionProps) {
  return (
    <section
      id={id}
      className={cn('relative isolate flex min-h-[38rem] items-end overflow-hidden bg-surface-inverse desktop:min-h-[85vh]', className)}
    >
      {media && (
        <div
          aria-hidden={false}
          className="absolute inset-0 -z-20 [&>*]:h-full [&>*]:w-full [&_[role=img]]:h-full [&_[role=img]]:rounded-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
        >
          {media}
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,hsl(var(--color-surface-inverse))_0%,hsl(var(--color-surface-inverse)/0.75)_28%,hsl(var(--color-surface-inverse)/0.25)_62%,transparent_100%)]"
      />

      <Container className="relative pb-16 pt-36 tablet:pb-20 desktop:pb-24">
        <div className="max-w-[46rem]">
          {eyebrow && (
            <Reveal>
              <Eyebrow tone="inverse" data-edit-path={editPaths?.eyebrow}>
                {eyebrow}
              </Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <HeroTitle
              lines={titleLines}
              tones={toneClasses.onInk}
              className="mt-5 text-[3rem] leading-[0.98] tracking-[-0.04em] tablet:text-7xl desktop:text-[5.5rem]"
            />
          </Reveal>
          {lead && (
            <Reveal delay={0.1}>
              <Text size="lg" data-edit-path={editPaths?.lead} className="mt-6 max-w-[32rem] text-text-inverse/75">
                {lead}
              </Text>
            </Reveal>
          )}
          <Reveal delay={0.15}>
            <HeroActions actions={actions} onInk className="mt-9" />
          </Reveal>
          <Reveal delay={0.2}>
            <HeroCredentials credentials={credentials} onInk className="mt-10" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
