'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import {
  READINESS_GROUP_LABELS,
  evaluateReadiness,
  type Project,
  type ReadinessCheck,
} from '@segevision/renderer';
import { StatusPill, StudioButton } from './studio';

/**
 * Launch-readiness ring.
 *
 * The number is never shown alone. Opening it reveals the exact checklist, and every
 * failing item names what is missing and offers to jump to the field that fixes it —
 * otherwise a percentage is just decoration that users learn to ignore.
 */
export function ReadinessRing({
  project,
  size = 40,
  onOpen,
  showLabel = false,
}: {
  project: Project;
  size?: number;
  onOpen?: () => void;
  showLabel?: boolean;
}) {
  const report = evaluateReadiness(project);
  const stroke = size >= 40 ? 3.5 : 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (report.percent / 100) * circumference;

  const tone =
    report.percent >= 90 ? 'text-studio-ok' : report.percent >= 60 ? 'text-studio-accent' : 'text-studio-warn';

  const ring = (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-studio-line" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn('transition-[stroke-dasharray] duration-[var(--t-layer)] ease-studio', tone)}
          stroke="currentColor"
        />
      </svg>
      <span
        className={cn('absolute font-studio-mono font-bold tabular-nums', size >= 40 ? 'text-[10px]' : 'text-[9px]', tone)}
        dir="ltr"
      >
        {report.percent}
      </span>
    </span>
  );

  if (!onOpen) return ring;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`מוכנות לפרסום ${report.percent} אחוז — ${report.missing.length} פריטים חסרים`}
      className="group inline-flex items-center gap-2 rounded-lg p-1 transition-colors duration-[var(--t-state)] hover:bg-studio-raised"
    >
      {ring}
      {showLabel && (
        <span className="text-start">
          <span className="block text-ui-sm font-bold text-studio-ink">
            {report.missing.length === 0 ? 'מוכן לפרסום' : 'חסרים פרטים'}
          </span>
          <span className="block text-ui-xs text-studio-muted">
            {report.missing.length === 0 ? 'כל הבדיקות עברו' : `${report.missing.length} פריטים`}
          </span>
        </span>
      )}
    </button>
  );
}

/** The checklist itself — the ring's explanation, never separated from it. */
export function ReadinessChecklist({
  project,
  onFix,
  compact = false,
}: {
  project: Project;
  onFix?: (check: ReadinessCheck) => void;
  compact?: boolean;
}) {
  const report = evaluateReadiness(project);
  const grouped = report.checks.reduce<Record<string, ReadinessCheck[]>>((acc, check) => {
    (acc[check.group] ??= []).push(check);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ReadinessRing project={project} size={48} />
        <div className="min-w-0">
          <p className="text-ui-base font-bold text-studio-ink">
            {report.missing.length === 0 ? 'הפרויקט מוכן לפרסום' : `${report.missing.length} פריטים לפני פרסום`}
          </p>
          <p className="text-ui-xs text-studio-muted">
            {report.passed} מתוך {report.total} בדיקות עברו
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(grouped).map(([group, checks]) => (
          <div key={group}>
            <p className="mb-1 text-ui-label font-bold uppercase tracking-wider text-studio-faint">
              {READINESS_GROUP_LABELS[group as keyof typeof READINESS_GROUP_LABELS]}
            </p>
            <ul className="flex flex-col">
              {checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2.5 py-1.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                      check.ok ? 'bg-studio-ok/15 text-studio-ok' : 'bg-studio-warn/15 text-studio-warn',
                    )}
                  >
                    {check.ok ? '✓' : '!'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-ui-sm', check.ok ? 'text-studio-muted' : 'font-semibold text-studio-ink')}>
                      {check.label}
                    </span>
                    {!check.ok && (
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-ui-xs leading-relaxed text-studio-muted">{check.missing}</span>
                        {onFix && !compact && (
                          <button
                            type="button"
                            onClick={() => onFix(check)}
                            className="shrink-0 rounded text-ui-xs font-bold text-studio-accent underline-offset-2 hover:underline"
                          >
                            תיקון
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadinessSummaryPill({ project }: { project: Project }) {
  const report = evaluateReadiness(project);
  return (
    <StatusPill tone={report.missing.length === 0 ? 'ok' : 'warn'}>
      {report.missing.length === 0 ? 'מוכן לפרסום' : `חסרים ${report.missing.length} פרטים`}
    </StatusPill>
  );
}

export { StudioButton };
