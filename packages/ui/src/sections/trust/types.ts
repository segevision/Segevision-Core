import type * as React from 'react';
import type { IconProps } from '@segevision/icons';

export type TrustVariant = 'strip' | 'stats' | 'credentials';

export interface TrustItem {
  icon?: React.ComponentType<IconProps>;
  /** Short, scannable claim. Keep it factual — this strip is the page's credibility anchor. */
  title: string;
  description?: string;
  editPath?: string;
}

export interface TrustStripProps {
  id?: string;
  variant?: TrustVariant;
  items: TrustItem[];
  tone?: 'ink' | 'surface' | 'alt';
  /** Lifts the strip into the section above it, tying hero and body together. */
  overlap?: boolean;
  className?: string;
}
