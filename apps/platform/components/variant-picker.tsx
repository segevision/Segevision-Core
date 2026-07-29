'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { variantsFor, type SectionType } from '@segevision/renderer';

/**
 * Visual variant picker.
 *
 * The miniatures are drawn in CSS rather than captured as images: they stay correct
 * when a variant is restyled, cost nothing to load, and follow the studio theme. They
 * are diagrams of the *layout decision* — where the type sits relative to the image —
 * which is the only thing a picker needs to communicate.
 */

const bar = 'rounded-[1px] bg-studio-line-strong';
const block = 'rounded-[2px] bg-studio-line-strong/70';

function Mini({ type, variant }: { type: SectionType; variant: string }) {
  const frame = 'flex h-full w-full gap-1 overflow-hidden rounded p-1.5';

  if (type === 'hero') {
    if (variant === 'split') {
      return (
        <div className={cn(frame, 'flex-row-reverse items-center bg-studio-ink/90')}>
          <div className="flex flex-1 flex-col justify-center gap-1">
            <div className="h-1.5 w-[85%] rounded-[1px] bg-white/80" />
            <div className="h-1.5 w-[60%] rounded-[1px] bg-white/35" />
            <div className="mt-0.5 h-1 w-[70%] rounded-[1px] bg-white/25" />
          </div>
          <div className="h-full w-[38%] rounded-[2px] bg-white/20" />
        </div>
      );
    }
    if (variant === 'editorial') {
      return (
        <div className={cn(frame, 'flex-col justify-start bg-studio-panel')}>
          <div className="h-2 w-[80%] rounded-[1px] bg-studio-ink/70" />
          <div className="h-1 w-[45%] rounded-[1px] bg-studio-line-strong" />
          <div className="mt-auto h-[38%] w-full rounded-[2px] bg-studio-line-strong/70" />
        </div>
      );
    }
    if (variant === 'cinematic') {
      return (
        <div className={cn(frame, 'flex-col justify-end bg-studio-ink')}>
          <div className="h-1.5 w-[70%] rounded-[1px] bg-white/85" />
          <div className="h-1 w-[45%] rounded-[1px] bg-white/40" />
        </div>
      );
    }
    return (
      <div className={cn(frame, 'flex-col justify-center bg-studio-panel')}>
        <div className="h-2 w-[72%] rounded-[1px] bg-studio-ink/70" />
        <div className="h-1 w-[50%] rounded-[1px] bg-studio-line-strong" />
        <div className="h-1 w-[38%] rounded-[1px] bg-studio-line-strong/70" />
      </div>
    );
  }

  if (type === 'services') {
    if (variant === 'grid') {
      return (
        <div className={cn(frame, 'flex-col bg-studio-panel')}>
          <div className="flex flex-1 gap-1">
            <div className={cn(block, 'flex-[7]')} /><div className={cn(block, 'flex-[5]')} />
          </div>
          <div className="flex flex-1 gap-1">
            <div className={cn(block, 'flex-[5]')} /><div className={cn(block, 'flex-[7]')} />
          </div>
        </div>
      );
    }
    if (variant === 'list') {
      return (
        <div className={cn(frame, 'flex-col justify-center gap-1.5 bg-studio-panel')}>
          {[80, 65, 72].map((w, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-studio-faint" />
              <div className={cn(bar, 'h-1')} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className={cn(frame, 'flex-col justify-center gap-1 bg-studio-panel')}>
        <div className="flex items-center gap-1"><div className={cn(block, 'h-3 w-3')} /><div className={cn(bar, 'h-1 flex-1')} /></div>
        <div className="flex flex-row-reverse items-center gap-1"><div className={cn(block, 'h-3 w-3')} /><div className={cn(bar, 'h-1 flex-1')} /></div>
        <div className="flex items-center gap-1"><div className={cn(block, 'h-3 w-3')} /><div className={cn(bar, 'h-1 flex-1')} /></div>
      </div>
    );
  }

  if (type === 'trust') {
    if (variant === 'strip') {
      return (
        <div className={cn(frame, 'items-center bg-studio-panel')}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-0.5"><div className={cn(bar, 'h-1 w-[80%]')} /><div className={cn(bar, 'h-0.5 w-[60%] opacity-60')} /></div>
          ))}
        </div>
      );
    }
    if (variant === 'stats') {
      return (
        <div className={cn(frame, 'items-start bg-studio-panel')}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-0.5"><div className={cn(bar, 'h-2 w-[85%] bg-studio-ink/60')} /><div className={cn(bar, 'h-0.5 w-[65%] opacity-60')} /></div>
          ))}
        </div>
      );
    }
    return (
      <div className={cn(frame, 'flex-col justify-center gap-1 bg-studio-panel')}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1 border-b border-studio-line pb-0.5 last:border-0">
            <span className="text-[5px] text-studio-faint">0{i + 1}</span>
            <div className={cn(bar, 'h-1 flex-1')} />
          </div>
        ))}
      </div>
    );
  }

  return <div className={cn(frame, 'flex-col justify-center gap-1 bg-studio-panel')}><div className={cn(bar, 'h-1 w-[70%]')} /><div className={cn(bar, 'h-1 w-[50%] opacity-60')} /></div>;
}

export function VariantPicker({
  type,
  value,
  onChange,
  className,
}: {
  type: SectionType;
  value: string;
  onChange: (variant: string) => void;
  className?: string;
}) {
  const variants = variantsFor(type);
  if (variants.length < 2) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="radiogroup"
        aria-label="בחירת מראה לסקשן"
        className="grid grid-cols-2 gap-2"
      >
        {variants.map((variant) => {
          const active = variant.id === value;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(variant.id)}
              title={variant.description}
              className={cn(
                'group flex flex-col gap-1.5 rounded-xl p-2 text-start transition-[background-color,box-shadow] duration-[var(--t-state)] ease-studio',
                active
                  ? 'bg-studio-accent-soft ring-2 ring-studio-accent'
                  : 'bg-studio-sunken ring-1 ring-inset ring-transparent hover:bg-studio-raised hover:ring-studio-line',
              )}
            >
              <span
                className={cn(
                  'block h-14 overflow-hidden rounded-lg ring-1 ring-inset transition-transform duration-[var(--t-state)] ease-studio',
                  active ? 'ring-studio-accent/40' : 'ring-studio-line group-hover:scale-[1.02]',
                )}
              >
                <Mini type={type} variant={variant.id} />
              </span>
              <span className="flex items-center justify-between gap-1">
                <span className={cn('text-ui-sm font-bold', active ? 'text-studio-accent' : 'text-studio-ink')}>
                  {variant.label}
                </span>
                {active && (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-studio-accent" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-ui-xs leading-snug text-studio-muted">{variant.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Mini as VariantMini };
