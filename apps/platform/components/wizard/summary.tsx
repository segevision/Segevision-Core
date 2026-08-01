'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  archetypeById,
  goalById,
  modeById,
  siteTypeById,
  styleById,
  type Archetype,
  type BusinessGoal,
  type ProjectMode,
  type SiteType,
  type StyleSystem,
} from '../../lib/wizard/catalog';

/**
 * The live project summary.
 *
 * Present from the first step and filled in as answers arrive, so the wizard never feels
 * like a form being submitted into the dark — at every point you can see the project taking
 * shape. Unanswered rows stay visible and muted rather than appearing one by one, which
 * keeps the panel from jumping as it fills.
 */

export interface WizardSelection {
  name: string;
  slug: string;
  mode: ProjectMode;
  goal: BusinessGoal | null;
  siteType: SiteType | null;
  archetype: Archetype | null;
  style: StyleSystem | null;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 text-ui-label text-studio-faint">{label}</span>
      <span
        className={cn(
          'min-w-0 truncate text-end text-ui-xs font-semibold',
          value ? 'text-studio-ink' : 'text-studio-faint',
        )}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

export function ProjectSummary({
  selection,
  className,
}: {
  selection: WizardSelection;
  className?: string;
}) {
  const archetype = selection.archetype ? archetypeById(selection.archetype) : null;
  const style = selection.style ? styleById(selection.style) : null;

  return (
    <aside
      className={cn('rounded-xl bg-studio-panel p-4 ring-1 ring-studio-line', className)}
      aria-label="סיכום הפרויקט"
    >
      <h2 className="text-ui-sm font-bold text-studio-ink">הפרויקט שנבנה</h2>

      <div className="mt-2 divide-y divide-studio-line">
        <Row label="שם" value={selection.name.trim() || null} />
        <Row label="כתובת" value={selection.slug.trim() || null} />
        <Row label="סוג פרויקט" value={modeById(selection.mode).label} />
        <Row label="מטרה" value={selection.goal ? goalById(selection.goal).label : null} />
        <Row
          label="תחום"
          value={selection.siteType ? siteTypeById(selection.siteType).label : null}
        />
        <Row label="ארכיטיפ" value={archetype?.label ?? null} />
        <Row label="שפה עיצובית" value={style?.label ?? null} />
      </div>

      {style ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-studio-sunken p-2">
          <span
            className="h-6 w-6 shrink-0 rounded-md ring-1 ring-inset ring-black/10"
            style={{ background: style.design.primaryColor }}
            aria-hidden="true"
          />
          <span
            className="h-6 w-6 shrink-0 rounded-md ring-1 ring-inset ring-black/10"
            style={{ background: style.design.secondaryColor }}
            aria-hidden="true"
          />
          <span className="min-w-0 text-ui-label leading-snug text-studio-muted">
            {style.design.headingFont} · {style.character.spacing} · {style.character.density}
          </span>
        </div>
      ) : null}

      {archetype ? (
        <div className="mt-3">
          <p className="text-ui-label text-studio-faint">סקשנים שייווצרו</p>
          <ol className="mt-1.5 flex flex-col gap-1">
            {archetype.stack.map((label, index) => (
              <li
                key={`${label}-${index}`}
                className="flex items-center gap-2 text-ui-xs text-studio-soft"
              >
                <span
                  dir="ltr"
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-studio-sunken font-studio-mono text-[9px] text-studio-faint"
                >
                  {index + 1}
                </span>
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </aside>
  );
}
