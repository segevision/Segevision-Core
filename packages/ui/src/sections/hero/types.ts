import type * as React from 'react';
import type { IconProps } from '@segevision/icons';

export type HeroVariant = 'split' | 'editorial' | 'cinematic' | 'minimal';

export interface HeroTitleLine {
  text: string;
  /** 'muted' de-emphasises a second clause so the first line carries the promise. */
  tone?: 'default' | 'muted' | 'accent';
  /** Stable edit address stamped onto the DOM for click-to-edit. */
  editPath?: string;
}

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ComponentType<IconProps>;
  ariaLabel?: string;
  editPath?: string;
}

export interface HeroCredential {
  icon?: React.ComponentType<IconProps>;
  label: string;
}

export interface HeroSectionProps {
  id?: string;
  variant?: HeroVariant;
  eyebrow?: string;
  /** Rendered as one <h1>; each line gets its own visual tone but the same semantics. */
  titleLines: HeroTitleLine[];
  lead?: string;
  actions?: HeroAction[];
  credentials?: HeroCredential[];
  /** Visual — usually an ImagePlaceholder or a real photograph. */
  media?: React.ReactNode;
  /** Content overlaying the media, e.g. a floating credential card. */
  mediaOverlay?: React.ReactNode;
  /** Edit addresses for the fields that are not part of titleLines/actions. */
  editPaths?: { eyebrow?: string; lead?: string };
  className?: string;
}
