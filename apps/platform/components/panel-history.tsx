'use client';

import * as React from 'react';
import type { Project } from '@segevision/renderer';
import { isRestorable, versionStore, type VersionEntry } from '../lib/history';
import { formatRelative } from '../lib/format';
import { EmptyNote, Panel, StudioButton } from './studio';

/**
 * Local version history.
 *
 * Restoring pushes onto the undo stack like any other change, so a restore performed
 * by mistake is itself undoable — the operation is never a one-way door.
 */
export function HistoryPanel({
  project,
  onRestore,
  refreshToken,
}: {
  project: Project;
  onRestore: (project: Project, label: string) => void;
  refreshToken: number;
}) {
  const [versions, setVersions] = React.useState<VersionEntry[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setVersions(versionStore.list(project.id));
  }, [project.id, refreshToken]);

  return (
    <Panel
      title="היסטוריית גרסאות"
      description="נשמרת מקומית בדפדפן. עד 20 גרסאות אחרונות לכל פרויקט."
      action={
        <StudioButton
          size="sm"
          onClick={() => {
            versionStore.save(project.id, project, 'שמירה ידנית');
            setVersions(versionStore.list(project.id));
          }}
        >
          שמירת גרסה
        </StudioButton>
      }
    >
      {error && (
        <p className="rounded-md bg-studio-warn/10 px-3 py-2 text-xs text-studio-warn ring-1 ring-inset ring-studio-warn/25">
          {error}
        </p>
      )}
      {versions.length === 0 ? (
        <EmptyNote>עוד לא נשמרו גרסאות. גרסה נשמרת אוטומטית בשינויים מבניים, ואפשר גם לשמור ידנית.</EmptyNote>
      ) : (
        <ul className="flex flex-col">
          {versions.map((version) => (
            <li key={version.id} className="flex flex-wrap items-center gap-3 border-b border-studio-line py-3 last:border-b-0">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-studio-ink">{version.label}</span>
                <span className="block text-xs text-studio-muted">{formatRelative(version.createdAt)}</span>
              </span>
              <StudioButton
                size="sm"
                onClick={() => {
                  if (!isRestorable(version)) {
                    setError('הגרסה נשמרה במבנה ישן ואינה ניתנת לשחזור אוטומטי.');
                    return;
                  }
                  setError(null);
                  onRestore(version.project, `שחזור: ${version.label}`);
                }}
              >
                מעבר לגרסה
              </StudioButton>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
