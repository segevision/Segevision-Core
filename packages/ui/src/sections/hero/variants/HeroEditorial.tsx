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
 * Magazine opening spread: type first on paper, photograph second and full-bleed.
 * Withholding the image above the fold is the confident move — it makes the sentence
 * carry the page, and the picture arrives as a reward rather than as decoration.
 */
export function HeroEditorial({
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
    <section id={id} className={cn('relative bg-surface pt-32 tablet:pt-36 desktop:pt-40', className)}>
      <Container>
        <div className="grid gap-10 desktop:grid-cols-12">
          <div className="desktop:col-span-8">
            {eyebrow && (
              <Reveal>
                <Eyebrow data-edit-path={editPaths?.eyebrow}>{eyebrow}</Eyebrow>
              </Reveal>
            )}
            <Reveal delay={0.05}>
              <HeroTitle
                lines={titleLines}
                tones={toneClasses.onSurface}
                className="mt-6 text-balance text-[2.5rem] leading-[1.04] tracking-[-0.035em] tablet:text-6xl desktop:text-[5.5rem]"
              />
            </Reveal>
          </div>

          <div className="desktop:col-span-4 desktop:pt-6">
            {lead && (
              <Reveal delay={0.1}>
                <Text
                  size="lg"
                  data-edit-path={editPaths?.lead}
                  className="max-w-[32rem] border-t border-border pt-6 text-text-secondary"
                >
                  {lead}
                </Text>
              </Reveal>
            )}
            <Reveal delay={0.15}>
              <HeroActions actions={actions} onInk={false} className="mt-8" />
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.2}>
          <HeroCredentials credentials={credentials} onInk={false} className="mt-12" />
        </Reveal>
      </Container>

      {media && (
        <Reveal delay={0.16} distance={28} className="mt-14 block">
          {/* Full-bleed: the plate interrupts the text measure on purpose. */}
          <div className="[&_[role=img]]:aspect-[16/7] [&_img]:aspect-[16/7] [&_img]:object-cover">{media}</div>
        </Reveal>
      )}
    </section>
  );
}
