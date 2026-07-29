'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { EDITABLE_FIELDS, SECTION_LABELS, homeSections, type Project } from '@segevision/renderer';

export interface Command {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  hint?: string;
  run: () => void;
}

/**
 * Command palette.
 *
 * Field commands are generated from the same registry that drives click-to-edit, so
 * anything reachable by clicking the preview is also reachable by typing — the two
 * routes can never drift out of sync.
 */
export function buildFieldCommands(
  project: Project,
  jump: (sectionId: string | undefined, path: string) => void,
): Command[] {
  const sections = homeSections(project);
  const commands: Command[] = [];

  for (const field of EDITABLE_FIELDS) {
    const matching = sections.filter((section) => section.type === field.sectionType);
    if (matching.length === 0) continue;

    matching.forEach((section, index) => {
      const suffix = matching.length > 1 ? ` · ${SECTION_LABELS[section.type]} ${index + 1}` : '';
      commands.push({
        id: `field-${section.id}-${field.path}`,
        label: `${field.label}${suffix}`,
        group: 'שדות',
        keywords: field.keywords,
        hint: field.group,
        run: () => jump(section.id, field.path),
      });
    });
  }

  return commands;
}

function score(command: Command, query: string): number {
  if (!query) return 1;
  const haystack = `${command.label} ${command.group} ${(command.keywords ?? []).join(' ')} ${command.hint ?? ''}`;
  const needle = query.trim();
  if (command.label.startsWith(needle)) return 3;
  if (command.label.includes(needle)) return 2;
  return haystack.includes(needle) ? 1 : 0;
}

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  const results = React.useMemo(() => {
    const scored = commands
      .map((command) => ({ command, value: score(command, query) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
    return scored.slice(0, 40).map((entry) => entry.command);
  }, [commands, query]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  React.useEffect(() => setActive(0), [query]);

  React.useEffect(() => {
    if (!open) return;
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  const grouped = results.reduce<Record<string, Command[]>>((acc, command) => {
    (acc[command.group] ??= []).push(command);
    return acc;
  }, {});
  let runningIndex = -1;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(results.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = results[active];
      if (command) {
        onClose();
        command.run();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="פלטת פקודות"
        className="relative flex max-h-[70vh] w-full max-w-[36rem] flex-col overflow-hidden rounded-xl bg-studio-panel shadow-2xl ring-1 ring-studio-line"
      >
        <div className="flex items-center gap-3 border-b border-studio-line px-4">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-studio-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" strokeLinecap="round" />
          </svg>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="חיפוש פקודה, שדה או הגדרה…"
            aria-label="חיפוש פקודה"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-[0.9375rem] text-studio-ink outline-none placeholder:text-studio-muted"
          />
          <kbd className="rounded border border-studio-line px-1.5 py-0.5 font-studio-mono text-[0.625rem] text-studio-muted">Esc</kbd>
        </div>

        <ul ref={listRef} role="listbox" aria-label="תוצאות" className="studio-scroll flex-1 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-studio-muted">לא נמצאו תוצאות</li>}
          {Object.entries(grouped).map(([group, items]) => (
            <li key={group}>
              <p className="px-3 pb-1 pt-3 font-studio-mono text-[0.625rem] uppercase tracking-wider text-studio-muted">{group}</p>
              <ul>
                {items.map((command) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const isActive = index === active;
                  return (
                    <li key={command.id}>
                      <button
                        type="button"
                        id={`cmd-${command.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => { onClose(); command.run(); }}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start text-sm transition-colors',
                          isActive ? 'bg-studio-accent/12 text-studio-ink' : 'text-studio-soft hover:bg-studio-raised',
                        )}
                      >
                        <span className="truncate font-semibold">{command.label}</span>
                        {command.hint && <span className="shrink-0 text-xs text-studio-muted">{command.hint}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
