'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { AlertIcon, CloseIcon } from '@segevision/icons';
import { Badge } from './Badge';

export type PlaceholderStatus = 'missing' | 'conflict' | 'assumed';

export interface PlaceholderEntry {
  id: string;
  /** Where on the page this appears, e.g. "כותרת ראשית" or "יצירת קשר". */
  area: string;
  item: string;
  status: PlaceholderStatus;
  /** What is currently rendered in its place. */
  currentValue?: string;
  /** For conflicts: the competing values found in the source material. */
  candidates?: string[];
  note?: string;
}

export interface PlaceholderLogProps {
  entries: PlaceholderEntry[];
  title?: string;
  description?: string;
  triggerLabel?: string;
  closeLabel?: string;
  statusLabels?: Record<PlaceholderStatus, string>;
  className?: string;
}

const defaultStatusLabels: Record<PlaceholderStatus, string> = {
  missing: 'חסר מידע',
  conflict: 'סתירה במקורות',
  assumed: 'הנחת עבודה',
};

const statusVariant: Record<PlaceholderStatus, 'outline' | 'accent' | 'soft'> = {
  missing: 'outline',
  conflict: 'accent',
  assumed: 'soft',
};

/**
 * Review-time panel listing every detail the site is still guessing at. Concept
 * sites fail review not because they have gaps but because the gaps are invisible:
 * a client cannot approve a phone number they were never told was unverified.
 * Render this only in review/preview builds.
 */
export function PlaceholderLog({
  entries,
  title = 'יומן פרטים לא מאומתים',
  description = 'הפריטים הבאים ממתינים לאישור הלקוח. עד שיאושרו הם מוצגים באתר כערכי פיתוח בלבד.',
  triggerLabel = 'פרטים לאימות',
  closeLabel = 'סגירת היומן',
  statusLabels = defaultStatusLabels,
  className,
}: PlaceholderLogProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (entries.length === 0) return null;

  return (
    <div className={cn('fixed bottom-20 start-4 z-40 tablet:bottom-5', className)}>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={title}
          tabIndex={-1}
          className="flex max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md bg-surface shadow-e4 ring-1 ring-border focus-visible:outline-none"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="font-display text-base font-bold text-text-primary">{title}</h2>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-text-secondary">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={closeLabel}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <CloseIcon size={20} aria-hidden="true" />
            </button>
          </div>

          <ul className="flex flex-col divide-y divide-border overflow-y-auto">
            {entries.map((entry) => (
              <li key={entry.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body text-xs text-text-secondary">{entry.area}</span>
                  <Badge variant={statusVariant[entry.status]}>{statusLabels[entry.status]}</Badge>
                </div>
                <p className="mt-2 font-display text-sm font-bold text-text-primary">{entry.item}</p>
                {entry.currentValue && (
                  <p className="mt-1.5 font-body text-xs text-text-secondary">
                    מוצג כרגע: <span className="font-semibold text-text-primary">{entry.currentValue}</span>
                  </p>
                )}
                {entry.candidates && entry.candidates.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {entry.candidates.map((candidate) => (
                      <li key={candidate} className="font-body text-xs text-text-primary">
                        • {candidate}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.note && (
                  <p className="mt-2 font-body text-xs leading-relaxed text-text-secondary">{entry.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-surface-inverse px-4 py-3 font-body text-sm font-semibold text-text-inverse shadow-e3 ring-1 ring-text-inverse/15 transition-transform duration-fast hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus motion-reduce:hover:scale-100"
        >
          <AlertIcon size={20} aria-hidden="true" className="text-accent" />
          {triggerLabel}
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-body text-xs font-bold text-surface-inverse">
            {entries.length}
          </span>
        </button>
      )}
    </div>
  );
}
