'use client';

import * as React from 'react';
import { HeroSplit } from './variants/HeroSplit';
import { HeroEditorial } from './variants/HeroEditorial';
import { HeroCinematic } from './variants/HeroCinematic';
import { HeroMinimal } from './variants/HeroMinimal';
import type { HeroSectionProps, HeroVariant } from './types';

export type { HeroSectionProps, HeroVariant, HeroTitleLine, HeroAction, HeroCredential } from './types';

const VARIANTS: Record<HeroVariant, React.ComponentType<HeroSectionProps>> = {
  split: HeroSplit,
  editorial: HeroEditorial,
  cinematic: HeroCinematic,
  minimal: HeroMinimal,
};

/**
 * Public hero API. One component, one prop contract; the variant only decides which
 * internal implementation draws it. Callers never import a variant directly, so a
 * variant can be rewritten without touching a single consumer.
 */
export function HeroSection({ variant = 'split', ...props }: HeroSectionProps) {
  const Implementation = VARIANTS[variant] ?? HeroSplit;
  return <Implementation {...props} />;
}
