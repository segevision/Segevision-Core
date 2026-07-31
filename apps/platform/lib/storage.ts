import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  migrateProject,
  parseProject,
  type Project,
  type ProjectSummary,
} from '@segevision/renderer';
import { physiothleticsProjectV1 } from './seed-physiothletics';
import { DATA_ROOT } from './data-root';

/**
 * Project storage — the file-backed implementation.
 *
 * Every read and write goes through the ProjectStore interface below, and this file is
 * the only thing in the app that knows about the filesystem. The Supabase
 * implementation of the same interface lives in ./stores/supabase-project-store.ts, and
 * ./project-store.ts decides which one a request gets.
 *
 * This store is a local-development and disaster-recovery adapter now, not the
 * production path: a serverless filesystem is read-only apart from an ephemeral /tmp,
 * so a deployment that reached this class would accept saves and then lose them.
 * ./project-store.ts refuses to select it in production unless SEGEVISION_DATA_ROOT
 * proves there is a real volume behind it.
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

export class FileProjectStore implements ProjectStore {
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

/**
 * Deliberately not exported as a bare `projectStore` any more.
 *
 * That name used to be the app-wide default, which is exactly the shape of mistake this
 * migration has to prevent: an import that silently writes client data to a disk that
 * will not exist tomorrow. Callers go through `resolveProjectStore()` in
 * ./project-store.ts, which makes the choice explicit and refuses the unsafe one.
 */
export const fileProjectStore: ProjectStore = new FileProjectStore();
export const PROJECT_DATA_DIR = DATA_DIR;
