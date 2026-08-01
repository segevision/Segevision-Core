'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';

/**
 * A selectable option in the wizard.
 *
 * Built on a real `<input type="radio">` rather than a styled button, which is what gives
 * arrow-key navigation between options, a single tab stop per group, and the correct
 * announcement to a screen reader — for free, and without a roving-tabindex implementation
 * that would drift out of step with the visual state.
 *
 * The visual is driven entirely by `peer-checked` and `peer-focus-visible`, so the ring the
 * eye sees and the state the browser holds can never disagree.
 */
export function OptionCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  preview,
  badge,
  note,
  disabled,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  title: string;
  description?: string;
  /** The miniature. Rendered in a fixed frame so a row of cards stays aligned. */
  preview?: React.ReactNode;
  /** Short status chip, e.g. "מומלץ". */
  badge?: string;
  /** Secondary line under the description — used for "available in a later milestone". */
  note?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'group relative block',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />

      <div
        className={cn(
          'flex h-full flex-col gap-2.5 rounded-xl bg-studio-panel p-3 ring-1 ring-studio-line',
          'transition-[box-shadow,transform,background-color] duration-[var(--t-state)] ease-studio',
          'peer-checked:bg-studio-accent-soft peer-checked:ring-2 peer-checked:ring-studio-accent',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-studio-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-studio-canvas',
          disabled
            ? 'opacity-55'
            : 'hover:-translate-y-0.5 hover:shadow-studio-md hover:ring-studio-line-strong',
        )}
      >
        {preview ? (
          <span className="block h-[5.5rem] overflow-hidden rounded-lg bg-studio-sunken ring-1 ring-inset ring-studio-line">
            {preview}
          </span>
        ) : null}

        <span className="flex items-start justify-between gap-2">
          {/* Driven by the prop, not by `peer-checked`: that variant compiles to a sibling
              combinator and cannot reach a descendant of the peer's sibling. */}
          <span
            className={cn(
              'text-ui-sm font-bold leading-tight',
              checked ? 'text-studio-accent' : 'text-studio-ink',
            )}
          >
            {title}
          </span>

          {badge ? (
            <span className="shrink-0 rounded-full bg-studio-accent px-1.5 py-0.5 text-ui-label font-bold text-studio-accent-ink">
              {badge}
            </span>
          ) : null}

          {/* The check mark only exists when selected, so an unselected card carries no
              empty circle that reads as a disabled control. */}
          <span
            aria-hidden="true"
            className={cn(
              'shrink-0 rounded-full bg-studio-accent p-0.5 text-studio-accent-ink opacity-0 transition-opacity duration-[var(--t-state)]',
              checked && !badge && 'opacity-100',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>

        {description ? (
          <span className="block text-ui-xs leading-relaxed text-studio-muted">{description}</span>
        ) : null}

        {note ? (
          <span className="mt-auto flex items-center gap-1.5 rounded-md bg-studio-sunken px-2 py-1.5 text-ui-label leading-snug text-studio-muted">
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
            </svg>
            {note}
          </span>
        ) : null}
      </div>
    </label>
  );
}
