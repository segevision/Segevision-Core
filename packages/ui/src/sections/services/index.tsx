'use client';

import * as React from 'react';
import { ServicesGrid } from './variants/ServicesGrid';
import { ServicesList } from './variants/ServicesList';
import { ServicesAlternating } from './variants/ServicesAlternating';
import type { ServiceGridProps, ServicesVariant } from './types';

export type { ServiceGridProps, ServiceItem, ServicesVariant } from './types';

const VARIANTS: Record<ServicesVariant, React.ComponentType<ServiceGridProps>> = {
  grid: ServicesGrid,
  list: ServicesList,
  alternating: ServicesAlternating,
};

/** Public services API — one prop contract, three internal layouts. */
export function ServiceGrid({ variant = 'grid', ...props }: ServiceGridProps) {
  const Implementation = VARIANTS[variant] ?? ServicesGrid;
  return <Implementation {...props} />;
}
