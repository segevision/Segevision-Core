'use client';

import { SCHEMA_VERSION, isSerializableProject, safeParseProject, type Project } from '@segevision/renderer';

/**
 * Undo/redo and local version history.
 *
 * Snapshots hold the complete project document — section order, enabled state,
 * variants, per-section content, design and business data — because that is exactly
 * what has to come back for a restore to be truthful. Transient editor UI (which tab
 * is open, which dropdown is expanded, scroll position) is deliberately excluded: it
 * is not part of the result, and storing it would make undo feel like it was moving
 * the editor around rather than the work.
 */

export interface VersionEntry {
  id: string;
  projectId: string;
  label: string;
  createdAt: string;
  /** Schema version at capture time, so a future migration can upgrade old entries. */
  schemaVersion: number;
  project: Project;
}

export interface VersionStore {
  list(projectId: string): VersionEntry[];
  save(projectId: string, project: Project, label: string): VersionEntry | null;
  get(projectId: string, versionId: string): VersionEntry | undefined;
  clear(projectId: string): void;
}

const STORAGE_KEY = 'segevision-version-history';
/** Enough to walk back through a working session without unbounded growth. */
const MAX_VERSIONS_PER_PROJECT = 20;

function readAll(): Record<string, VersionEntry[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, VersionEntry[]>) : {};
  } catch {
    return {};
  }
}

function writeAll(value: Record<string, VersionEntry[]>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota or private mode — history degrades to in-session undo, which still works.
  }
}

class LocalVersionStore implements VersionStore {
  list(projectId: string): VersionEntry[] {
    const entries = readAll()[projectId] ?? [];
    // Entries written by an older schema are hidden rather than deleted: they stay in
    // storage in case a future migration can lift them.
    return entries
      .filter((entry) => entry.schemaVersion === SCHEMA_VERSION)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  save(projectId: string, project: Project, label: string): VersionEntry | null {
    // A snapshot that cannot round-trip through JSON, or that no longer satisfies the
    // schema, is worse than no snapshot — restoring it would corrupt the project.
    if (!isSerializableProject(project)) return null;

    const entry: VersionEntry = {
      id: `ver-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      label,
      createdAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      project: JSON.parse(JSON.stringify(project)) as Project,
    };

    const all = readAll();
    const existing = all[projectId] ?? [];
    all[projectId] = [entry, ...existing].slice(0, MAX_VERSIONS_PER_PROJECT);
    writeAll(all);
    return entry;
  }

  get(projectId: string, versionId: string): VersionEntry | undefined {
    return (readAll()[projectId] ?? []).find((entry) => entry.id === versionId);
  }

  clear(projectId: string): void {
    const all = readAll();
    delete all[projectId];
    writeAll(all);
  }
}

export const versionStore: VersionStore = new LocalVersionStore();

/**
 * Validates a snapshot before it is applied back to the editor.
 * Restoring is the one operation that can destroy work, so it is checked twice.
 */
export function isRestorable(entry: VersionEntry): boolean {
  return entry.schemaVersion === SCHEMA_VERSION && safeParseProject(entry.project).success;
}

/**
 * MIGRATION TO SUPABASE
 * ---------------------
 * A `project_versions` table (id, project_id, label, schema_version, data jsonb,
 * created_at) plus a SupabaseVersionStore implementing the four methods above is the
 * whole change. Nothing in the editor imports anything from this file except
 * `versionStore` and the two helpers, so the swap is a one-line export change.
 */
