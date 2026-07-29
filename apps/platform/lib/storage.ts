import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  MigrationError,
  migrateProject,
  parseProject,
  type Project,
  type ProjectSummary,
} from '@segevision/renderer';
import { physiothleticsProjectV1 } from './seed-physiothletics';
import { DATA_ROOT } from './data-root';

/**
 * Project storage — v1.
 *
 * Every read and write goes through the ProjectStore interface below. The file-backed
 * implementation is deliberately the only thing that knows about the filesystem, so
 * moving to Supabase later means writing one more class that satisfies the same five
 * methods; nothing in the API routes or the editor changes. See MIGRATION note at the
 * bottom of this file.
 */

export interface ProjectStore {
  list(): Promise<ProjectSummary[]>;
  get(id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  update(id: string, project: Project): Promise<Project>;
  remove(id: string): Promise<void>;
}

/**
 * Data lives at the monorepo root rather than inside apps/platform on purpose: Next's
 * dev server watches the app directory, and writing project files into a watched path
 * would trigger a recompile on every autosave.
 *
 * The root is resolved from the workspace marker rather than from `process.cwd()`, so
 * the location no longer depends on which directory the server was started in. See
 * `./data-root` for why that mattered.
 */
const DATA_DIR = process.env.SEGEVISION_DATA_DIR ?? path.join(DATA_ROOT, 'projects');

async function ensureDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

const fileFor = (id: string) => path.join(DATA_DIR, `${id}.json`);
const BACKUP_DIR = path.join(DATA_DIR, '..', 'backups');

/**
 * Copies a project file aside before a migration rewrites it.
 *
 * A migration that overwrites in place is a migration you cannot undo. The backup is
 * written first and the write is abandoned if the backup fails.
 */
async function backupBeforeMigration(id: string, raw: string): Promise<void> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await writeFile(path.join(BACKUP_DIR, `${id}--${stamp}.json`), raw, 'utf-8');
}

/** Guards against a crafted id escaping the data directory. */
function assertSafeId(id: string): void {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error('מזהה פרויקט לא חוקי');
  }
}

class FileProjectStore implements ProjectStore {
  /**
   * The first run of a fresh clone should not show an empty dashboard — Physiothletics
   * is written in as a real, editable project rather than being special-cased in the UI.
   *
   * Deliberately not memoised: a cached "already seeded" flag would mean that clearing
   * the data directory while the server is running leaves the dashboard permanently
   * empty. One readdir per request is cheaper than that class of bug.
   */
  private async seedIfEmpty(): Promise<void> {
    await ensureDir();
    const files = await readdir(DATA_DIR);
    if (files.filter((file) => file.endsWith('.json')).length === 0) {
      const seeded = migrateProject(physiothleticsProjectV1).project;
      await writeFile(fileFor(seeded.id), JSON.stringify(seeded, null, 2), 'utf-8');
    }
  }

  async list(): Promise<ProjectSummary[]> {
    await this.seedIfEmpty();
    const files = (await readdir(DATA_DIR)).filter((file) => file.endsWith('.json'));
    const projects: ProjectSummary[] = [];

    for (const file of files) {
      try {
        const raw = JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf-8'));
        // The listing migrates in memory only — it never rewrites files, so opening
        // the dashboard can never mutate a project the user has not touched.
        const { project } = migrateProject(raw);
        const { id, name, slug, industry, template, status, createdAt, updatedAt } = project;
        projects.push({ id, name, slug, industry, template, status, createdAt, updatedAt });
      } catch {
        // A corrupt or future-schema file must not take the dashboard down with it.
        continue;
      }
    }

    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Project | null> {
    assertSafeId(id);
    await this.seedIfEmpty();

    let text: string;
    try {
      text = await readFile(fileFor(id), 'utf-8');
    } catch {
      return null;
    }

    const raw = JSON.parse(text);
    // migrateProject throws on an incompatible document. That propagates on purpose:
    // the route turns it into a clear Hebrew error rather than silently returning
    // null, which the editor would have shown as "project not found".
    const { project, migrated } = migrateProject(raw);

    if (migrated) {
      await backupBeforeMigration(id, text);
      await writeFile(fileFor(id), JSON.stringify(project, null, 2), 'utf-8');
    }

    return project;
  }

  async create(project: Project): Promise<Project> {
    assertSafeId(project.id);
    await ensureDir();
    const validated = parseProject(project);
    await writeFile(fileFor(validated.id), JSON.stringify(validated, null, 2), 'utf-8');
    return validated;
  }

  async update(id: string, project: Project): Promise<Project> {
    assertSafeId(id);
    await ensureDir();
    const validated = parseProject({ ...project, id, updatedAt: new Date().toISOString() });
    await writeFile(fileFor(id), JSON.stringify(validated, null, 2), 'utf-8');
    return validated;
  }

  async remove(id: string): Promise<void> {
    assertSafeId(id);
    try {
      await unlink(fileFor(id));
    } catch {
      // Deleting something that is already gone is a success, not an error.
    }
  }
}

export const projectStore: ProjectStore = new FileProjectStore();
export const PROJECT_DATA_DIR = DATA_DIR;

/**
 * MIGRATION TO SUPABASE
 * ---------------------
 * 1. Create a `projects` table: id (text, pk), owner_id (uuid), data (jsonb),
 *    updated_at (timestamptz). The whole project document lives in `data`, so the
 *    Zod schema stays the single source of truth and no migration is needed when a
 *    content field is added.
 * 2. Add SupabaseProjectStore implementing this same interface — list() selects the
 *    summary columns only, get() selects data, update() upserts.
 * 3. Swap the export on the last line. The API routes, the editor and the renderer
 *    are untouched because none of them import anything from this file except
 *    `projectStore`.
 * 4. Row Level Security on owner_id becomes the auth boundary; the routes then read
 *    the session instead of trusting the caller. That is the only new code path.
 */
