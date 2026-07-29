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
 * Type only, no image at all — the fastest hero to load and the one that survives a
 * client with no photography. Space does the work a picture would otherwise do, so
 * the vertical rhythm here is deliberately more generous than the other variants.
 */
export function HeroMinimal({
  id,
  eyebrow,
  titleLines,
  lead,
  actions = [],
  credentials = [],
  editPaths,
  className,
}: HeroSectionProps) {
  return (
    <section id={id} className={cn('bg-surface pb-20 pt-36 tablet:pt-40 desktop:pb-28 desktop:pt-48', className)}>
      <Container>
        <div className="max-w-[52rem]">
          {eyebrow && (
            <Reveal>
              <Eyebrow data-edit-path={editPaths?.eyebrow}>{eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <HeroTitle
              lines={titleLines}
              tones={toneClasses.onSurface}
              className="mt-6 text-balance text-[2.75rem] leading-[1.04] tracking-[-0.035em] tablet:text-6xl desktop:text-7xl"
            />
          </Reveal>
          {lead && (
            <Reveal delay={0.1}>
              <Text size="xl" data-edit-path={editPaths?.lead} className="mt-7 max-w-[36rem] text-text-secondary">
                {lead}
              </Text>
            </Reveal>
          )}
          <Reveal delay={0.15}>
            <HeroActions actions={actions} onInk={false} className="mt-10" />
          </Reveal>
          <Reveal delay={0.2}>
            <HeroCredentials credentials={credentials} onInk={false} className="mt-12" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
