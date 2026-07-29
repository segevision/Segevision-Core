'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  SECTION_LABELS,
  homeSections,
  moveSection,
  variantsFor,
  type Project,
  type SectionInstance,
} from '@segevision/renderer';
import { VariantMini } from './variant-picker';
import { IconButton, Menu, Toggle, Tooltip } from './studio';

/**
 * The site structure rail — the editor's primary navigation.
 *
 * This replaces system tabs with the page itself. A section is one row: it is what
 * you select, what you edit, what you reorder and what lights up in the preview. That
 * removes the old two-step of "pick a tab, then pick a section", which was the single
 * biggest source of clicks in the previous build.
 */

export interface SectionRowAction {
  duplicate: (section: SectionInstance) => void;
  reset: (section: SectionInstance) => void;
  savePreset: (section: SectionInstance) => void;
  remove: (section: SectionInstance) => void;
  toggle: (section: SectionInstance) => void;
}

/** Sections that hold no editable copy still appear, but read as structural. */
const STRUCTURAL = new Set(['header', 'footer', 'mobileBar']);

function sectionName(section: SectionInstance, all: SectionInstance[]): string {
  const sameType = all.filter((item) => item.type === section.type);
  if (sameType.length < 2) return SECTION_LABELS[section.type];
  return `${SECTION_LABELS[section.type]} · ${sameType.indexOf(section) + 1}`;
}

export function SiteStructure({
  project,
  selectedId,
  onSelect,
  onReorder,
  actions,
  className,
}: {
  project: Project;
  selectedId: string | null;
  onSelect: (sectionId: string) => void;
  onReorder: (sections: SectionInstance[]) => void;
  actions: SectionRowAction;
  className?: string;
}) {
  const sections = homeSections(project);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const positions = React.useRef<Map<string, number>>(new Map());

  /**
   * FLIP: measure before the list re-renders, then play the delta back so a row
   * visibly travels to its new place instead of teleporting.
   */
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const next = new Map<string, number>();

    list.querySelectorAll<HTMLElement>('[data-section-row]').forEach((row) => {
      const id = row.dataset.sectionRow!;
      const top = row.getBoundingClientRect().top;
      next.set(id, top);
      const previous = positions.current.get(id);
      if (previous !== undefined && Math.abs(previous - top) > 1 && !reduced) {
        row.animate(
          [{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }],
          { duration: 160, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
    });
    positions.current = next;
  });

  const move = (id: string, offset: number) => onReorder(moveSection(sections, id, offset));

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = sections.findIndex((s) => s.id === dragId);
    const to = sections.findIndex((s) => s.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next.map((section, index) => ({ ...section, order: index })));
  };

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <ul ref={listRef} className="flex flex-col gap-0.5">
        {sections.map((section, index) => {
          const selected = section.id === selectedId;
          const structural = STRUCTURAL.has(section.type);
          const variants = variantsFor(section.type);
          const variantLabel = variants.find((v) => v.id === section.variant)?.label;

          return (
            <li
              key={section.id}
              data-section-row={section.id}
              data-selected={selected ? 'true' : undefined}
              draggable
              onDragStart={() => setDragId(section.id)}
              onDragEnd={() => { setDragId(null); setOverId(null); }}
              onDragOver={(event) => { event.preventDefault(); setOverId(section.id); }}
              onDrop={(event) => { event.preventDefault(); handleDrop(section.id); setOverId(null); }}
              className={cn(
                'group relative rounded-lg transition-[background-color,opacity] duration-[var(--t-state)] ease-studio',
                selected ? 'bg-studio-accent-soft' : 'hover:bg-studio-raised',
                dragId === section.id && 'opacity-40',
                overId === section.id && dragId !== section.id && 'ring-2 ring-inset ring-studio-accent/60',
              )}
            >
              {/* Fixed 44px row: scannable, and a comfortable pointer target. */}
              <div className="flex h-11 items-center gap-1.5 pe-1 ps-1.5">
                <span
                  aria-hidden="true"
                  className="flex cursor-grab flex-col gap-[3px] px-1 py-2 opacity-0 transition-opacity duration-[var(--t-state)] group-hover:opacity-100"
                >
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-[2px] w-2.5 rounded-full bg-studio-faint" />
                  ))}
                </span>

                <button
                  type="button"
                  onClick={() => onSelect(section.id)}
                  aria-current={selected ? 'true' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-start"
                >
                  <span className="font-studio-mono text-[10px] tabular-nums text-studio-faint" dir="ltr">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span
                    className={cn(
                      'h-7 w-9 shrink-0 overflow-hidden rounded ring-1 ring-inset ring-studio-line transition-opacity',
                      !section.enabled && 'opacity-35',
                    )}
                  >
                    <VariantMini type={section.type} variant={section.variant} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-ui-sm font-semibold',
                        !section.enabled ? 'text-studio-faint line-through' : selected ? 'text-studio-accent' : 'text-studio-ink',
                      )}
                    >
                      {sectionName(section, sections)}
                    </span>
                    <span className="block truncate text-ui-label text-studio-faint">
                      {structural ? 'רכיב קבוע' : variantLabel ?? SECTION_LABELS[section.type]}
                    </span>
                  </span>
                </button>

                {/*
                 * One control, not four. Every button parked here costs the section name
                 * width whether it is visible or not, and at rail width four of them left
                 * the name a single character per line. Reordering lives on the drag handle
                 * and inside this menu, which keeps it reachable from the keyboard.
                 */}
                <span className="shrink-0 opacity-0 transition-opacity duration-[var(--t-state)] focus-within:opacity-100 group-hover:opacity-100">
                  <Menu
                    label={`פעולות — ${sectionName(section, sections)}`}
                    items={[
                      ...(index > 0
                        ? [{ id: 'up', label: 'הזזה למעלה', onSelect: () => move(section.id, -1) }]
                        : []),
                      ...(index < sections.length - 1
                        ? [{ id: 'down', label: 'הזזה למטה', onSelect: () => move(section.id, 1) }]
                        : []),
                      { id: 'dup', label: 'שכפול', onSelect: () => actions.duplicate(section) },
                      { id: 'reset', label: 'איפוס לתבנית', onSelect: () => actions.reset(section) },
                      { id: 'preset', label: 'שמירה כפריסט', onSelect: () => actions.savePreset(section) },
                      { id: 'del', label: 'מחיקה', tone: 'danger', onSelect: () => actions.remove(section) },
                    ]}
                  />
                </span>

                <span className="shrink-0 ps-0.5">
                  <Toggle
                    size="sm"
                    tone="quiet"
                    checked={section.enabled}
                    onChange={() => actions.toggle(section)}
                    label={`${section.enabled ? 'כיבוי' : 'הפעלת'} ${sectionName(section, sections)}`}
                  />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
