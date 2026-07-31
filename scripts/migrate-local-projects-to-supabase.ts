/**
 * One-time migration: local .data projects and media -> Supabase.
 *
 * Run from the repo root:
 *
 *   pnpm migrate:projects              # dry run. Reads everything, writes nothing.
 *   pnpm migrate:projects -- --execute # performs the migration
 *   pnpm migrate:projects -- --execute --upsert
 *
 * Design rules, in the order they matter:
 *
 *   1. Dry run is the default. An external write needs --execute, spelled out.
 *   2. Validate everything before writing anything. One invalid document aborts the whole
 *      run: a half-migrated dataset is worse than an unmigrated one, because you no longer
 *      know which side is authoritative.
 *   3. Never delete or modify a local file. .data is the rollback plan.
 *   4. Existing remote rows are never overwritten unless --upsert is given explicitly.
 *   5. No service-role key. The script signs in as the owner with email and password, so
 *      every write goes through the same RLS policies the app uses. A migration that needs
 *      RLS switched off is a migration that can write to the wrong account.
 *   6. Read back and re-validate every row after writing, then compare counts.
 *
 * Rollback: nothing local is touched, so rolling back is deleting what was written —
 * see printRollbackInstructions() at the bottom, which prints the exact statements.
 */

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
// Imported from source rather than the package entry point on purpose: the package index
// re-exports the React renderer, and a Node script has no business loading JSX or CSS to
// validate a JSON document.
import { parseProject, type Project } from '../packages/renderer/src/schema';
import { MigrationError, migrateProject } from '../packages/renderer/src/migrate';

/**
 * Anchored on the workspace marker rather than on `import.meta` or `process.cwd()`.
 *
 * `import.meta` is unavailable when tsx loads this as CommonJS, and cwd is whatever
 * directory the command happened to be run from — a migration that resolves .data
 * differently depending on where it was launched is a migration that can report "nothing
 * to do" while three projects sit on disk.
 */
function findWorkspaceRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      fail(`Could not find the workspace root (no pnpm-workspace.yaml above ${start}).`);
    }
    dir = parent;
  }
}

const REPO_ROOT = findWorkspaceRoot(__dirname);
const DATA_ROOT = process.env.SEGEVISION_DATA_ROOT
  ? path.resolve(process.env.SEGEVISION_DATA_ROOT)
  : path.join(REPO_ROOT, '.data');
const PROJECTS_DIR = path.join(DATA_ROOT, 'projects');
const MEDIA_DIR = path.join(DATA_ROOT, 'media');
const REPORT_DIR = path.join(DATA_ROOT, 'migration-reports');
const MEDIA_BUCKET = 'project-media';

const ALLOWED_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  gif: 'image/gif',
};

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/**
 * Minimal .env.local reader.
 *
 * A dependency for this would be a dependency in the repo root forever, and the format we
 * need is four lines of KEY=VALUE. Values are taken literally apart from surrounding
 * quotes; an already-set process variable always wins, so CI can override the file.
 */
async function loadEnvFile(file: string): Promise<void> {
  if (!existsSync(file)) return;
  const contents = await readFile(file, 'utf-8');

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key] !== undefined) continue;
    const raw = trimmed.slice(separator + 1).trim();
    process.env[key] = raw.replace(/^(['"])(.*)\1$/, '$2');
  }
}

interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  email: string;
  password: string;
  execute: boolean;
  upsert: boolean;
}

function readConfig(): Config {
  const execute = process.argv.includes('--execute');
  const upsert = process.argv.includes('--upsert');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const email = process.env.SUPABASE_MIGRATION_EMAIL;
  const password = process.env.SUPABASE_MIGRATION_PASSWORD;

  const missing = [
    !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !supabaseKey && 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    !email && 'SUPABASE_MIGRATION_EMAIL',
    !password && 'SUPABASE_MIGRATION_PASSWORD',
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    fail(
      `Missing ${missing.join(', ')}.\n` +
        'The two NEXT_PUBLIC_ values live in apps/platform/.env.local.\n' +
        'The migration credentials are the account that will own the projects. Pass them for\n' +
        'this command only, so they are never written to a file:\n\n' +
        '  SUPABASE_MIGRATION_EMAIL=you@example.com SUPABASE_MIGRATION_PASSWORD=... \\\n' +
        '    pnpm migrate:projects -- --execute',
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseKey: supabaseKey!,
    email: email!,
    password: password!,
    execute,
    upsert,
  };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

type ProjectOutcome =
  'validated' | 'created' | 'updated' | 'skipped-exists' | 'skipped-slug-conflict' | 'failed';

interface MediaOutcome {
  slot: string;
  localKey: string;
  remoteKey: string | null;
  bytes: number;
  status:
    'uploaded' | 'planned' | 'missing-file' | 'unsupported-type' | 'already-remote' | 'failed';
  detail?: string;
}

interface ProjectReport {
  id: string;
  name: string;
  slug: string;
  status: string;
  schemaVersion: number;
  migratedInMemory: boolean;
  outcome: ProjectOutcome;
  detail?: string;
  media: MediaOutcome[];
}

interface Report {
  startedAt: string;
  finishedAt: string;
  mode: 'dry-run' | 'execute';
  upsert: boolean;
  ownerId: string;
  dataRoot: string;
  localProjectCount: number;
  remoteProjectCountBefore: number;
  remoteProjectCountAfter: number;
  unreferencedMediaFiles: string[];
  projects: ProjectReport[];
}

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function heading(text: string): void {
  console.log(`\n${text}\n${'─'.repeat(text.length)}`);
}

// ---------------------------------------------------------------------------
// Step 1 — read and validate every local project
// ---------------------------------------------------------------------------

interface LocalProject {
  file: string;
  project: Project;
  migratedInMemory: boolean;
}

/**
 * Reads and validates every local project, or aborts.
 *
 * Documents written by an older schema are migrated in memory — the same code path the app
 * uses — so schemaVersion is carried forward rather than frozen at whatever was on disk.
 * The local file is never rewritten.
 */
async function readLocalProjects(): Promise<LocalProject[]> {
  if (!existsSync(PROJECTS_DIR)) {
    fail(`No projects directory at ${PROJECTS_DIR}. Nothing to migrate.`);
  }

  const files = (await readdir(PROJECTS_DIR)).filter((file) => file.endsWith('.json')).sort();
  const results: LocalProject[] = [];
  const failures: string[] = [];

  for (const file of files) {
    const absolute = path.join(PROJECTS_DIR, file);
    try {
      const raw = JSON.parse(await readFile(absolute, 'utf-8')) as unknown;
      const { project, migrated } = migrateProject(raw);
      // parseProject after migrateProject: the migration produces a document, this proves
      // it is a *valid* one. Uploading anything that fails here would move a corrupt
      // document into the database and call it a success.
      const validated = parseProject(project);

      const idFromFile = path.basename(file, '.json');
      if (validated.id !== idFromFile) {
        failures.push(`${file}: document id "${validated.id}" does not match the file name.`);
        continue;
      }

      results.push({ file, project: validated, migratedInMemory: migrated });
    } catch (cause) {
      const reason = cause instanceof MigrationError ? cause.message : String(cause);
      failures.push(`${file}: ${reason}`);
    }
  }

  if (failures.length > 0) {
    fail(
      `${failures.length} local project(s) failed validation. Nothing was written.\n\n` +
        failures.map((line) => `  • ${line}`).join('\n') +
        '\n\nFix or move these files aside, then run again. No partial migrations.',
    );
  }

  if (results.length === 0) {
    fail(`No .json projects found in ${PROJECTS_DIR}.`);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Step 2 — media
// ---------------------------------------------------------------------------

/** `/api/media/<projectId>/<file>` -> `<projectId>/<file>`, or null if not a local src. */
function localKeyFromSrc(src: string): string | null {
  const match = /^\/api\/media\/(.+)$/.exec(src);
  if (!match) return null;
  const key = match[1];
  // A key that already carries four segments was written by the Supabase store and needs
  // no migration.
  return key.split('/').length === 2 ? key : null;
}

function slugifySlot(slot: string): string {
  const folded = slot.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return folded.length > 0 ? folded.slice(0, 80) : 'slot';
}

/**
 * Plans, and optionally performs, the media move for one project.
 *
 * Returns the rewritten media array. `src` has to change because the key shape changes:
 * two segments locally, `<owner>/<project>/<slot>/<file>` in the bucket. Rewriting is done
 * on a copy — the document on disk keeps pointing at the local file, which is what makes
 * rollback a no-op.
 */
async function migrateProjectMedia(
  supabase: SupabaseClient,
  ownerId: string,
  project: Project,
  execute: boolean,
): Promise<{ media: Project['media']; outcomes: MediaOutcome[] }> {
  const outcomes: MediaOutcome[] = [];
  const media: Project['media'] = [];

  for (const entry of project.media) {
    if (!entry.src) {
      media.push(entry);
      continue;
    }

    const localKey = localKeyFromSrc(entry.src);
    if (!localKey) {
      media.push(entry);
      outcomes.push({
        slot: entry.slot,
        localKey: entry.src,
        remoteKey: null,
        bytes: 0,
        status: 'already-remote',
      });
      continue;
    }

    const absolute = path.join(MEDIA_DIR, ...localKey.split('/'));
    const extension = localKey.split('.').pop()?.toLowerCase() ?? '';
    const contentType = ALLOWED_TYPES[extension];

    if (!contentType) {
      media.push(entry);
      outcomes.push({
        slot: entry.slot,
        localKey,
        remoteKey: null,
        bytes: 0,
        status: 'unsupported-type',
        detail: `extension "${extension}" is not an allowed image type`,
      });
      continue;
    }

    if (!existsSync(absolute)) {
      // The document references an image that is not on disk. Keeping the old src is the
      // honest outcome: it is already broken locally, and inventing a remote key would
      // hide that.
      media.push(entry);
      outcomes.push({
        slot: entry.slot,
        localKey,
        remoteKey: null,
        bytes: 0,
        status: 'missing-file',
        detail: absolute,
      });
      continue;
    }

    const bytes = await readFile(absolute);
    const fileName = localKey.split('/')[1];
    const remoteKey = `${ownerId}/${project.id}/${slugifySlot(entry.slot)}/${fileName}`;

    if (!execute) {
      media.push({ ...entry, src: `/api/media/${remoteKey}` });
      outcomes.push({
        slot: entry.slot,
        localKey,
        remoteKey,
        bytes: bytes.byteLength,
        status: 'planned',
      });
      continue;
    }

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(remoteKey, bytes, {
      contentType,
      // Re-running the migration must be safe. The key is derived deterministically from
      // the local file name, so an upsert here rewrites the same bytes to the same place.
      upsert: true,
    });

    if (error) {
      media.push(entry);
      outcomes.push({
        slot: entry.slot,
        localKey,
        remoteKey,
        bytes: bytes.byteLength,
        status: 'failed',
        detail: error.message,
      });
      continue;
    }

    media.push({ ...entry, src: `/api/media/${remoteKey}` });
    outcomes.push({
      slot: entry.slot,
      localKey,
      remoteKey,
      bytes: bytes.byteLength,
      status: 'uploaded',
    });
  }

  return { media, outcomes };
}

/** Local media files that no project document references. Reported, never uploaded. */
async function findUnreferencedMedia(projects: LocalProject[]): Promise<string[]> {
  if (!existsSync(MEDIA_DIR)) return [];

  const referenced = new Set<string>();
  for (const { project } of projects) {
    for (const entry of project.media) {
      const key = entry.src ? localKeyFromSrc(entry.src) : null;
      if (key) referenced.add(key);
    }
  }

  const found: string[] = [];
  for (const projectDir of await readdir(MEDIA_DIR, { withFileTypes: true })) {
    if (!projectDir.isDirectory()) continue;
    for (const file of await readdir(path.join(MEDIA_DIR, projectDir.name))) {
      const key = `${projectDir.name}/${file}`;
      if (!referenced.has(key)) found.push(key);
    }
  }
  return found.sort();
}

// ---------------------------------------------------------------------------
// Step 3 — the migration itself
// ---------------------------------------------------------------------------

interface RemoteRow {
  id: string;
  slug: string;
}

async function readRemoteRows(supabase: SupabaseClient): Promise<RemoteRow[]> {
  const { data, error } = await supabase.from('projects').select('id,slug');
  if (error) {
    fail(
      `Could not read the projects table: ${error.message}\n` +
        'Has supabase/migrations/20260730120000_projects.sql been applied to this project?',
    );
  }
  return (data ?? []) as RemoteRow[];
}

async function main(): Promise<void> {
  await loadEnvFile(path.join(REPO_ROOT, 'apps/platform/.env.local'));
  const config = readConfig();
  const startedAt = new Date().toISOString();

  heading(config.execute ? 'MIGRATION — EXECUTE' : 'MIGRATION — DRY RUN (nothing will be written)');
  console.log(`data root : ${DATA_ROOT}`);
  console.log(`supabase  : ${config.supabaseUrl}`);
  console.log(`upsert    : ${config.upsert ? 'yes (existing rows will be overwritten)' : 'no'}`);

  // 1. Local side first. If anything here is wrong we have not touched the network.
  const local = await readLocalProjects();
  console.log(`\n✓ ${local.length} local project(s) read and validated`);
  for (const item of local) {
    const note = item.migratedInMemory ? ' (schema migrated in memory)' : '';
    console.log(
      `   • ${item.project.id}  ${item.project.slug}  v${item.project.schemaVersion}${note}`,
    );
  }

  // 2. Sign in. RLS applies to everything below this line.
  const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  });

  if (authError || !auth.user) {
    fail(
      `Sign-in failed: ${authError?.message ?? 'no user returned'}\n` +
        'The account must already exist in Supabase (Authentication -> Users).',
    );
  }

  const ownerId = auth.user.id;
  console.log(`\n✓ signed in as ${auth.user.email}`);
  console.log(`   owner_id: ${ownerId}`);

  // 3. Remote state, for duplicate detection.
  const remoteBefore = await readRemoteRows(supabase);
  const remoteById = new Map(remoteBefore.map((row) => [row.id, row]));
  const remoteBySlug = new Map(remoteBefore.map((row) => [row.slug, row]));
  console.log(`✓ ${remoteBefore.length} project(s) already in Supabase for this account`);

  const unreferencedMedia = await findUnreferencedMedia(local);

  // 4. Plan and, with --execute, perform.
  const reports: ProjectReport[] = [];

  for (const { project, migratedInMemory } of local) {
    const base: ProjectReport = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      status: project.status,
      schemaVersion: project.schemaVersion,
      migratedInMemory,
      outcome: 'validated',
      media: [],
    };

    const existingById = remoteById.get(project.id);
    const existingBySlug = remoteBySlug.get(project.slug);

    // A different project already holding this slug is a conflict the script must not
    // resolve on its own: renaming someone's project silently is not a migration decision.
    if (existingBySlug && existingBySlug.id !== project.id) {
      reports.push({
        ...base,
        outcome: 'skipped-slug-conflict',
        detail: `slug "${project.slug}" already belongs to project ${existingBySlug.id}`,
      });
      continue;
    }

    if (existingById && !config.upsert) {
      reports.push({
        ...base,
        outcome: 'skipped-exists',
        detail: 'already in Supabase. Re-run with --upsert to overwrite it.',
      });
      continue;
    }

    const { media, outcomes } = await migrateProjectMedia(
      supabase,
      ownerId,
      project,
      config.execute,
    );

    // Validate again after the src rewrite. The document that gets written is this one, so
    // this is the check that actually guards the database.
    let document: Project;
    try {
      document = parseProject({ ...project, media });
    } catch (cause) {
      reports.push({
        ...base,
        outcome: 'failed',
        detail: `document became invalid after media rewrite: ${String(cause)}`,
        media: outcomes,
      });
      continue;
    }

    if (!config.execute) {
      reports.push({
        ...base,
        outcome: existingById ? 'updated' : 'created',
        detail: 'planned only — dry run',
        media: outcomes,
      });
      continue;
    }

    const row = {
      id: document.id,
      owner_id: ownerId,
      name: document.name,
      slug: document.slug,
      status: document.status,
      project_data: document,
      schema_version: document.schemaVersion,
      created_at: document.createdAt,
      updated_at: document.updatedAt,
    };

    const { error } = config.upsert
      ? await supabase.from('projects').upsert(row, { onConflict: 'id' })
      : await supabase.from('projects').insert(row);

    if (error) {
      reports.push({ ...base, outcome: 'failed', detail: error.message, media: outcomes });
      continue;
    }

    reports.push({
      ...base,
      outcome: existingById ? 'updated' : 'created',
      media: outcomes,
    });
  }

  // 5. Verify. Read every migrated row back and re-validate it, then compare counts.
  const remoteAfter = config.execute ? await readRemoteRows(supabase) : remoteBefore;

  if (config.execute) {
    heading('VERIFICATION');
    let verified = 0;
    const problems: string[] = [];

    for (const report of reports) {
      if (report.outcome !== 'created' && report.outcome !== 'updated') continue;
      const { data, error } = await supabase
        .from('projects')
        .select('project_data')
        .eq('id', report.id)
        .maybeSingle();

      if (error || !data) {
        problems.push(`${report.id}: could not be read back (${error?.message ?? 'no row'})`);
        continue;
      }
      try {
        parseProject((data as { project_data: unknown }).project_data);
        verified += 1;
      } catch (cause) {
        problems.push(`${report.id}: stored document failed validation (${String(cause)})`);
      }
    }

    console.log(`round-tripped and re-validated : ${verified}`);
    console.log(`local projects                 : ${local.length}`);
    console.log(`remote projects before         : ${remoteBefore.length}`);
    console.log(`remote projects after          : ${remoteAfter.length}`);
    if (problems.length > 0) {
      console.log('\nproblems:');
      problems.forEach((line) => console.log(`  ✖ ${line}`));
    }
  }

  // 6. Report.
  const report: Report = {
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: config.execute ? 'execute' : 'dry-run',
    upsert: config.upsert,
    ownerId,
    dataRoot: DATA_ROOT,
    localProjectCount: local.length,
    remoteProjectCountBefore: remoteBefore.length,
    remoteProjectCountAfter: remoteAfter.length,
    unreferencedMediaFiles: unreferencedMedia,
    projects: reports,
  };

  await mkdir(REPORT_DIR, { recursive: true });
  const reportFile = path.join(
    REPORT_DIR,
    `${report.mode}-${startedAt.replace(/[:.]/g, '-')}.json`,
  );
  await writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8');

  printSummary(report, reportFile);
  if (config.execute) printRollbackInstructions(report);
  else console.log('\nNothing was written. Re-run with --execute to perform the migration.\n');

  await supabase.auth.signOut();

  const failed = reports.filter((item) => item.outcome === 'failed');
  if (failed.length > 0) process.exit(1);
}

function printSummary(report: Report, reportFile: string): void {
  heading('SUMMARY');

  const tally = new Map<ProjectOutcome, number>();
  for (const item of report.projects) {
    tally.set(item.outcome, (tally.get(item.outcome) ?? 0) + 1);
  }
  for (const [outcome, count] of [...tally.entries()].sort()) {
    console.log(`${outcome.padEnd(24)} ${count}`);
  }

  const mediaTally = new Map<MediaOutcome['status'], number>();
  for (const item of report.projects) {
    for (const media of item.media) {
      mediaTally.set(media.status, (mediaTally.get(media.status) ?? 0) + 1);
    }
  }
  if (mediaTally.size > 0) {
    console.log('');
    for (const [status, count] of [...mediaTally.entries()].sort()) {
      console.log(`media: ${status.padEnd(17)} ${count}`);
    }
  }

  for (const item of report.projects) {
    if (item.detail && item.outcome !== 'created' && item.outcome !== 'updated') {
      console.log(`\n  ${item.outcome}: ${item.id} — ${item.detail}`);
    }
    for (const media of item.media) {
      if (media.status === 'failed' || media.status === 'missing-file') {
        console.log(`  media ${media.status}: ${item.id} ${media.slot} — ${media.detail ?? ''}`);
      }
    }
  }

  if (report.unreferencedMediaFiles.length > 0) {
    console.log(
      `\n${report.unreferencedMediaFiles.length} local media file(s) are not referenced by any` +
        ' project and were left alone:',
    );
    report.unreferencedMediaFiles.forEach((key) => console.log(`  • ${key}`));
  }

  console.log(`\nreport: ${reportFile}`);
}

function printRollbackInstructions(report: Report): void {
  const written = report.projects
    .filter((item) => item.outcome === 'created' || item.outcome === 'updated')
    .map((item) => item.id);

  heading('ROLLBACK');
  console.log('Local files were not modified. .data is still the complete original dataset,');
  console.log('and every project document there still points at its local image.');
  console.log('');
  console.log('To undo this run:');
  console.log('  1. Set PROJECT_STORE=file in apps/platform/.env.local and restart the app.');
  console.log('     The platform is immediately back on the local dataset.');
  console.log('  2. Optional — remove what was written, in the Supabase SQL editor:');
  if (written.length > 0) {
    const list = written.map((id) => `'${id}'`).join(', ');
    console.log(`       delete from public.projects where id in (${list});`);
  } else {
    console.log('       (no rows were written)');
  }
  console.log('  3. Optional — remove uploaded images, in Storage -> project-media,');
  console.log(`     folder ${report.ownerId}/.`);
  console.log('');
  console.log('Keep .data for at least a month after cutover, and enable Point-in-Time');
  console.log('Recovery on the Supabase project before treating it as the only copy.');
  console.log('');
}

main().catch((cause) => {
  console.error('\n✖ migration aborted:', cause);
  process.exit(1);
});
