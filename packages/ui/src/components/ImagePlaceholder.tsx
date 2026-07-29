import * as React from 'react';
import { cn } from '@segevision/utils';
import { ImageIcon } from '@segevision/icons';

export interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Describes the photograph that belongs here — shown to the client during review. */
  label: string;
  /** When supplied, the real image renders and the placeholder treatment disappears entirely. */
  src?: string;
  alt?: string;
  /** CSS aspect-ratio, e.g. "4 / 5" for a portrait or "16 / 9" for a wide shot. */
  ratio?: string;
  tone?: 'brand' | 'ink' | 'neutral';
  /** Optional second line: art-direction guidance, credit, or a sizing note. */
  note?: string;
  badge?: string;
}

const toneMap: Record<NonNullable<ImagePlaceholderProps['tone']>, string> = {
  brand: 'bg-[linear-gradient(135deg,hsl(var(--color-brand-primary)/0.14),hsl(var(--color-accent)/0.18))] text-brand-primary',
  ink: 'bg-[linear-gradient(135deg,hsl(var(--color-surface-inverse)/0.9),hsl(var(--color-brand-primary)/0.75))] text-text-inverse',
  neutral: 'bg-surface-alt text-text-secondary',
};

/**
 * Honest stand-in for photography that has not been shot or licensed yet. It is
 * deliberately designed rather than grey-boxed: a client reviewing a concept should
 * be able to read the intended composition, while never mistaking it for final art.
 */
export const ImagePlaceholder = React.forwardRef<HTMLDivElement, ImagePlaceholderProps>(
  ({ label, src, alt, ratio = '4 / 3', tone = 'brand', note, badge = 'תמונה להשלמה', className, ...props }, ref) => {
    if (src) {
      return (
        <div
          ref={ref}
          className={cn('w-full overflow-hidden rounded-md bg-surface-alt', className)}
          style={{ aspectRatio: ratio }}
          {...props}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt ?? label} className="h-full w-full object-cover" loading="lazy" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="img"
        aria-label={`מציין מקום לתמונה: ${label}`}
        className={cn(
          // w-full matters: with only an aspect-ratio, a caller that also stretches the
          // height (h-full in a tall grid row) would have the width derived from that
          // height and blow out of its column.
          'relative isolate flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-md p-6 text-center',
          'ring-1 ring-inset ring-border/70',
          toneMap[tone],
          className,
        )}
        style={{ aspectRatio: ratio }}
        {...props}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(120%_100%_at_50%_0%,black,transparent_75%)]"
        />
        <ImageIcon size={24} aria-hidden="true" className="opacity-70" />
        <span className="font-display text-base font-bold leading-snug">{label}</span>
        {note && <span className="max-w-[22rem] text-sm leading-normal opacity-75">{note}</span>}
        <span className="mt-1 rounded-full bg-surface/80 px-3 py-1 font-body text-xs font-semibold text-text-primary ring-1 ring-inset ring-border">
          {badge}
        </span>
      </div>
    );
  },
);
ImagePlaceholder.displayName = 'ImagePlaceholder';
