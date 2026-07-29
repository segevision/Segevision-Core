'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../../../components/Container';
import { Eyebrow } from '../../../components/Eyebrow';
import { Reveal } from '../../../components/Reveal';
import { Text } from '../../../components/Text';
import { HeroActions, HeroCredentials, HeroTitle, InkBackdrop, toneClasses } from '../shared';
import type { HeroSectionProps } from '../types';

/**
 * The asymmetric 7/5 split on ink. A centred hero forces every element to compete for
 * the same optical axis; the asymmetry lets the headline own the reading entry point
 * while the image carries the emotional register.
 */
export function HeroSplit({
  id,
  eyebrow,
  titleLines,
  lead,
  actions = [],
  credentials = [],
  media,
  mediaOverlay,
  editPaths,
  className,
}: HeroSectionProps) {
  return (
    <section id={id} className={cn('relative isolate overflow-hidden bg-surface-inverse', className)}>
      <InkBackdrop />
      <Container className="relative pb-16 pt-32 tablet:pb-20 tablet:pt-36 desktop:pb-24 desktop:pt-40">
        <div className="grid items-center gap-12 desktop:grid-cols-12 desktop:gap-10">
          <div className="desktop:col-span-7">
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
                className="mt-5 text-[2.75rem] leading-[1.05] tracking-[-0.03em] tablet:text-6xl desktop:text-7xl"
              />
            </Reveal>
            {lead && (
              <Reveal delay={0.1}>
                <Text size="lg" data-edit-path={editPaths?.lead} className="mt-6 max-w-[34rem] text-text-inverse/70">
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

          {media && (
            <Reveal delay={0.12} distance={28} className="relative desktop:col-span-5">
              <div className="relative">
                {media}
                {mediaOverlay && <div className="absolute inset-x-0 bottom-0">{mediaOverlay}</div>}
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
