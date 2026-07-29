import type * as React from 'react';
import type { IconProps } from '@segevision/icons';

export type ServicesVariant = 'grid' | 'list' | 'alternating';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<IconProps>;
  /** Short "who this is for" tags — helps a visitor self-select in under a second. */
  tags?: string[];
  action?: { label: string; href: string };
  editPaths?: { title?: string; description?: string };
}

export interface ServiceGridProps {
  id?: string;
  variant?: ServicesVariant;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  items: ServiceItem[];
  editPaths?: { title?: string; lead?: string; eyebrow?: string };
  className?: string;
}
