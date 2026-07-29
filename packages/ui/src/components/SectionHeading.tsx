import * as React from 'react';
import { cn } from '@segevision/utils';
import { Eyebrow } from './Eyebrow';
import { Heading } from './Heading';
import { Text } from './Text';
import { Reveal } from './Reveal';

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  level?: 2 | 3;
  align?: 'start' | 'center';
  tone?: 'default' | 'inverse';
  /** Slot for a CTA or meta content placed opposite the title on desktop. */
  aside?: React.ReactNode;
  /** Stable edit addresses stamped for click-to-edit. */
  editPaths?: { eyebrow?: string; title?: string; lead?: string };
}

/**
 * The single heading pattern every section uses. Centralising it is what keeps
 * rhythm consistent across a page — sections differ in content, never in how
 * their title block is spaced or scaled.
 */
export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ eyebrow, title, lead, level = 2, align = 'start', tone = 'default', aside, editPaths, className, ...props }, ref) => {
    const inverse = tone === 'inverse';
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-6 desktop:flex-row desktop:items-end desktop:justify-between',
          align === 'center' && 'desktop:flex-col desktop:items-center',
          className,
        )}
        {...props}
      >
        <Reveal className={cn('max-w-[46rem]', align === 'center' && 'text-center')}>
          {eyebrow && (
            <Eyebrow tone={inverse ? 'inverse' : 'accent'} data-edit-path={editPaths?.eyebrow}>
              {eyebrow}
            </Eyebrow>
          )}
          <Heading
            level={level}
            size="4xl"
            data-edit-path={editPaths?.title}
            className={cn(
              'mt-4 text-balance leading-[1.12] tracking-[-0.02em] desktop:text-5xl',
              inverse && 'text-text-inverse',
            )}
          >
            {title}
          </Heading>
          {lead && (
            <Text
              size="lg"
              data-edit-path={editPaths?.lead}
              className={cn('mt-5 max-w-[38rem]', inverse ? 'text-text-inverse/70' : 'text-text-secondary')}
            >
              {lead}
            </Text>
          )}
        </Reveal>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    );
  },
);
SectionHeading.displayName = 'SectionHeading';
