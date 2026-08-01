'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { ArchetypeDefinition, ProjectMode, StyleDefinition } from '../../lib/wizard/catalog';

/**
 * Wizard miniatures.
 *
 * Drawn in CSS, like the existing VariantMini, and for the same reasons: they cannot go
 * stale when a layout is restyled, they cost no network, and they follow the studio theme.
 *
 * The rule each one follows is that it must communicate the *decision*, not decorate the
 * card. A mode miniature shows how many pages and how the page is shaped. An archetype
 * miniature shows the actual section stack. A style miniature renders the same hero with
 * the style's own palette, heading face, corner radius and button weight — so the eight
 * styles are told apart by looking, which is the whole point of the step.
 */

const frame = 'flex h-full w-full flex-col overflow-hidden rounded-[3px]';

/* ------------------------------------------------------------------ mode */

export function ModeMini({ mode }: { mode: ProjectMode }) {
  const line = 'rounded-[1px] bg-studio-line-strong';
  const block = 'rounded-[2px] bg-studio-line-strong/60';

  if (mode === 'landing') {
    // One tall page, one call to action.
    return (
      <div className={cn(frame, 'gap-1 bg-studio-panel p-2')}>
        <div className="h-[42%] rounded-[2px] bg-studio-line-strong/70" />
        <div className={cn(line, 'h-1 w-[70%]')} />
        <div className={cn(line, 'h-1 w-[50%] opacity-60')} />
        <div className="mt-auto h-2 w-[45%] rounded-[2px] bg-studio-accent" />
      </div>
    );
  }

  if (mode === 'catalog') {
    return (
      <div className={cn(frame, 'gap-1 bg-studio-panel p-2')}>
        <div className={cn(line, 'h-1 w-[45%]')} />
        <div className="grid flex-1 grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={block} />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'commerceDemo') {
    // Gallery beside options, plus a sticky purchase bar — the product page shape.
    return (
      <div className={cn(frame, 'bg-studio-panel p-2')}>
        <div className="flex flex-1 flex-row-reverse gap-1">
          <div className="w-[52%] rounded-[2px] bg-studio-line-strong/70" />
          <div className="flex flex-1 flex-col gap-1">
            <div className={cn(line, 'h-1 w-[80%]')} />
            <div className={cn(line, 'h-1 w-[40%] opacity-60')} />
            <div className="mt-0.5 flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-studio-line-strong" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-[2px] bg-studio-accent" />
      </div>
    );
  }

  if (mode === 'concept') {
    // The disclaimer band is the defining feature of concept mode.
    return (
      <div className={cn(frame, 'bg-studio-panel')}>
        <div className="h-2 w-full bg-studio-warn/80" />
        <div className="flex flex-1 flex-col gap-1 p-2">
          <div className="h-[45%] rounded-[2px] bg-studio-line-strong/70" />
          <div className={cn(line, 'h-1 w-[65%]')} />
          <div className={cn(line, 'h-1 w-[45%] opacity-60')} />
        </div>
      </div>
    );
  }

  if (mode === 'redesign') {
    // Before and after, side by side.
    return (
      <div className={cn(frame, 'flex-row-reverse gap-1 bg-studio-panel p-2')}>
        <div className="flex flex-1 flex-col gap-1 opacity-40">
          <div className="h-[40%] rounded-[2px] bg-studio-line-strong" />
          <div className={cn(line, 'h-1 w-[80%]')} />
          <div className={cn(line, 'h-1 w-[60%]')} />
        </div>
        <div className="w-px bg-studio-line-strong" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-[40%] rounded-[2px] bg-studio-accent/50" />
          <div className={cn(line, 'h-1 w-[80%]')} />
          <div className={cn(line, 'h-1 w-[60%]')} />
        </div>
      </div>
    );
  }

  // live — a full multi-section page.
  return (
    <div className={cn(frame, 'gap-1 bg-studio-panel p-2')}>
      <div className="h-1 w-full rounded-[1px] bg-studio-line-strong/70" />
      <div className="h-[38%] rounded-[2px] bg-studio-line-strong/70" />
      <div className="flex gap-1">
        <div className={cn(block, 'h-3 flex-1')} />
        <div className={cn(block, 'h-3 flex-1')} />
        <div className={cn(block, 'h-3 flex-1')} />
      </div>
      <div className="mt-auto h-1 w-full rounded-[1px] bg-studio-line-strong/70" />
    </div>
  );
}

/* ------------------------------------------------------------- archetype */

/**
 * The archetype's section stack, drawn as a page.
 *
 * An earlier version drew every section as a plain bar of varying height, and the seven
 * archetypes came out looking the same — which made the step decorative rather than
 * informative. Each section kind now has its own silhouette: a hero splits into image and
 * type, a collection is a grid, a trust strip is a thin row of marks, a form has a button.
 * Two archetypes are told apart by shape, not by counting bars.
 */
type BandKind = 'hero' | 'grid' | 'strip' | 'columns' | 'lines' | 'form' | 'chips' | 'people';

const BAND_KIND: { match: RegExp; kind: BandKind; flex: number }[] = [
  { match: /פתיחה/, kind: 'hero', flex: 4 },
  { match: /גלריי?ת|רשת|תוצאות/, kind: 'grid', flex: 3 },
  { match: /רצועה|רצועת|סרגל/, kind: 'strip', flex: 1 },
  { match: /בחירת מידה|מדריך מידות|שובר/, kind: 'chips', flex: 1.6 },
  { match: /הצוות/, kind: 'people', flex: 2.2 },
  { match: /טופס|יצירת קשר|מוצא המתנה/, kind: 'form', flex: 2.6 },
  { match: /שאלות|משלוח|תהליך/, kind: 'lines', flex: 2 },
];

function bandFor(label: string): { kind: BandKind; flex: number } {
  const rule = BAND_KIND.find((item) => item.match.test(label));
  return rule ? { kind: rule.kind, flex: rule.flex } : { kind: 'columns', flex: 2.2 };
}

const ink = 'bg-studio-line-strong';
const inkSoft = 'bg-studio-line-strong/50';

function Band({ kind }: { kind: BandKind }) {
  switch (kind) {
    case 'hero':
      return (
        <div className="flex h-full flex-row-reverse gap-1">
          <div className={cn('w-[40%] rounded-[2px]', ink)} />
          <div className="flex flex-1 flex-col justify-center gap-[3px]">
            <div className={cn('h-[3px] w-[85%] rounded-[1px]', ink)} />
            <div className={cn('h-[2px] w-[60%] rounded-[1px]', inkSoft)} />
            <div className={cn('h-[2px] w-[45%] rounded-[1px]', inkSoft)} />
          </div>
        </div>
      );
    case 'grid':
      return (
        <div className="grid h-full grid-cols-3 gap-[3px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn('rounded-[1px]', inkSoft)} />
          ))}
        </div>
      );
    case 'strip':
      return (
        <div className="flex h-full items-center justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn('h-[3px] w-[15%] rounded-full', inkSoft)} />
          ))}
        </div>
      );
    case 'columns':
      return (
        <div className="flex h-full gap-[3px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn('flex-1 rounded-[2px]', inkSoft)} />
          ))}
        </div>
      );
    case 'people':
      return (
        <div className="flex h-full items-center justify-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn('h-3.5 w-3.5 rounded-full', inkSoft)} />
          ))}
        </div>
      );
    case 'chips':
      return (
        <div className="flex h-full items-center gap-1">
          {[26, 20, 24, 16].map((w, i) => (
            <div
              key={i}
              style={{ width: `${w}%` }}
              className={cn('h-[6px] rounded-full', inkSoft)}
            />
          ))}
        </div>
      );
    case 'form':
      return (
        <div className="flex h-full flex-col justify-center gap-[3px]">
          <div className={cn('h-[4px] w-full rounded-[1px]', inkSoft)} />
          <div className={cn('h-[4px] w-full rounded-[1px]', inkSoft)} />
          <div className={cn('mt-[2px] h-[5px] w-[35%] rounded-[1px]', ink)} />
        </div>
      );
    case 'lines':
    default:
      return (
        <div className="flex h-full flex-col justify-center gap-[3px]">
          {[90, 70, 80].map((w, i) => (
            <div
              key={i}
              style={{ width: `${w}%` }}
              className={cn('h-[2px] rounded-[1px]', inkSoft)}
            />
          ))}
        </div>
      );
  }
}

export function ArchetypeMini({ archetype }: { archetype: ArchetypeDefinition }) {
  // Four bands, not the whole stack: past four the frame gives each one too few pixels to
  // hold its silhouette, and every archetype collapses back into stripes.
  const bands = archetype.stack.slice(0, 4).map((label) => ({ label, ...bandFor(label) }));

  return (
    <div className={cn(frame, 'gap-[3px] bg-studio-panel p-1.5')}>
      {bands.map((band, index) => (
        <div key={`${band.label}-${index}`} style={{ flex: band.flex }} className="min-h-0">
          <Band kind={band.kind} />
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- style */

/**
 * The same hero, rendered in the candidate style.
 *
 * Everything visible here comes from the style definition — palette, heading face, corner
 * radius, button weight — so the difference between two cards is the difference the
 * created project will actually have. Nothing is hand-tuned per style.
 */
export function StyleMini({ style }: { style: StyleDefinition }) {
  const { primaryColor, secondaryColor, headingFont, radius, buttonStyle } = style.design;

  const corner = radius === 'sharp' ? '1px' : radius === 'soft' ? '4px' : '9px';
  const button =
    buttonStyle === 'solid'
      ? { background: primaryColor, border: `1px solid ${primaryColor}` }
      : buttonStyle === 'outline'
        ? { background: 'transparent', border: `1px solid ${primaryColor}` }
        : // A ghost button drawn literally — no fill, no border — renders as nothing, and a
          // card with an empty slot reads as broken rather than as a style choice. A faint
          // wash keeps it recognisably a text button and still clearly not the other two.
          { background: `${primaryColor}1F`, border: '1px solid transparent' };

  return (
    <div
      className="flex h-full w-full flex-col justify-between overflow-hidden p-2.5"
      style={{ background: '#fff', borderRadius: corner }}
    >
      <div className="flex flex-col gap-1">
        <div
          style={{ background: secondaryColor, borderRadius: '1px' }}
          className="h-[3px] w-[22%]"
        />
        {/* The heading face is the loudest signal a style has, so it is real type. */}
        <div
          style={{ color: primaryColor, fontFamily: `'${headingFont}', sans-serif` }}
          className="text-[11px] font-extrabold leading-tight"
        >
          כותרת ראשית
        </div>
        <div
          style={{ background: `${primaryColor}22`, borderRadius: '1px' }}
          className="h-[3px] w-[70%]"
        />
        <div
          style={{ background: `${primaryColor}18`, borderRadius: '1px' }}
          className="h-[3px] w-[52%]"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <div style={{ ...button, borderRadius: corner }} className="h-[11px] w-[38%]" />
        <div
          style={{ background: `${primaryColor}14`, borderRadius: corner }}
          className="h-[11px] w-[22%]"
        />
      </div>
    </div>
  );
}
