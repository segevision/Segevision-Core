'use client';

import * as React from 'react';
import { TrustStripRow } from './variants/TrustStripRow';
import { TrustStats } from './variants/TrustStats';
import { TrustCredentials } from './variants/TrustCredentials';
import type { TrustStripProps, TrustVariant } from './types';

export type { TrustStripProps, TrustItem, TrustVariant } from './types';

const VARIANTS: Record<TrustVariant, React.ComponentType<TrustStripProps>> = {
  strip: TrustStripRow,
  stats: TrustStats,
  credentials: TrustCredentials,
};

/** Public trust API — one prop contract, three internal treatments. */
export function TrustStrip({ variant = 'strip', ...props }: TrustStripProps) {
  const Implementation = VARIANTS[variant] ?? TrustStripRow;
  return <Implementation {...props} />;
}
