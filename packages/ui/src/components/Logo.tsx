import * as React from 'react';
import { cn } from '@segevision/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Client wordmark / name — always required as an accessible fallback. */
  name: string;
  /** Optional client logo image; if omitted, renders a typographic wordmark. */
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-6 text-lg',
  md: 'h-8 text-xl',
  lg: 'h-10 text-2xl',
};

/**
 * Generic wrapper — actual logos differ per client, so this component only
 * standardizes sizing/placement and guarantees an accessible text fallback,
 * never hardcodes a specific brand mark.
 */
export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ name, src, size = 'md', className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2 font-display font-bold', sizeMap[size], className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={cn('w-auto', sizeMap[size].split(' ')[0])} />
      ) : (
        <span>{name}</span>
      )}
    </div>
  ),
);
Logo.displayName = 'Logo';
