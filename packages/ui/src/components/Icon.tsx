import * as React from 'react';
import { cn } from '@segevision/utils';
import type { IconProps as BaseIconProps } from '@segevision/icons';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: React.ComponentType<BaseIconProps>;
  size?: 16 | 20 | 24 | 32;
  /** Flips the icon in RTL contexts — use only for directional icons (arrows), never brand/status icons. */
  flipRtl?: boolean;
  label?: string;
}

/**
 * Uniform wrapper so every icon in the system is sized/colored consistently
 * regardless of subject matter (Design System v1, Part 2 — Icon System).
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ icon: IconComponent, size = 24, flipRtl = false, label, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-flex shrink-0 items-center justify-center', flipRtl && 'rtl:-scale-x-100', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <IconComponent size={size} />
    </span>
  ),
);
Icon.displayName = 'Icon';
