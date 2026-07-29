'use client';

import * as React from 'react';
import { fieldDomId, type Project } from '@segevision/renderer';

export type Updater = (
  recipe: (draft: Project) => Project,
  options?: { coalesceKey?: string },
) => void;

/** A request from click-to-edit or the command palette to reveal one field. */
export interface FieldFocus {
  sectionId?: string;
  path: string;
  /** Bumped on every request so repeating the same jump still re-triggers. */
  nonce: number;
}

export interface PanelProps {
  project: Project;
  update: Updater;
  focus?: FieldFocus | null;
}

/**
 * Scrolls a focused field into view and highlights it.
 *
 * The highlight sits on the wrapper rather than the control so a textarea's own focus
 * ring is not doubled, and it clears itself so the editor never stays visually stuck
 * on the last jump.
 */
export function useFieldFocus(focus: FieldFocus | null | undefined) {
  React.useEffect(() => {
    if (!focus) return;
    const id = fieldDomId(focus.sectionId, focus.path);

    const timer = window.setTimeout(() => {
      const element = document.getElementById(id);
      if (!element) return;
      element.scrollIntoView({ block: 'center', behavior: 'smooth' });
      element.querySelector<HTMLElement>('input, textarea, select')?.focus({ preventScroll: true });
      element.dataset.fieldHighlight = 'true';
      window.setTimeout(() => delete element.dataset.fieldHighlight, 1800);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [focus]);
}

/** Wrapper giving a field the DOM id the registry expects, plus the jump highlight. */
export function Addressable({
  sectionId,
  path,
  children,
}: {
  sectionId?: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={fieldDomId(sectionId, path)}
      className="rounded-md transition-shadow duration-300 data-[field-highlight]:ring-2 data-[field-highlight]:ring-studio-accent data-[field-highlight]:ring-offset-4 data-[field-highlight]:ring-offset-studio-panel"
    >
      {children}
    </div>
  );
}

export function ReorderButtons({
  index,
  length,
  onMove,
}: {
  index: number;
  length: number;
  onMove: (offset: number) => void;
}) {
  return (
    <span className="inline-flex">
      {[
        { offset: -1, label: 'הזזה למעלה', disabled: index === 0, path: 'm18 15-6-6-6 6' },
        { offset: 1, label: 'הזזה למטה', disabled: index === length - 1, path: 'm6 9 6 6 6-6' },
      ].map((button) => (
        <button
          key={button.label}
          type="button"
          onClick={() => onMove(button.offset)}
          disabled={button.disabled}
          aria-label={button.label}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d={button.path} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </span>
  );
}

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function moveItem<T>(list: T[], index: number, offset: number): T[] {
  const target = index + offset;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
