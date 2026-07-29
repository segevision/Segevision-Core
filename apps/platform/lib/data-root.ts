import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Where local project data lives.
 *
 * This used to be `path.join(process.cwd(), '..', '..', '.data')`, which silently
 * assumed the server was always launched from `apps/platform`. That assumption holds
 * for `pnpm --filter @segevision/platform dev` and breaks for every other entry point:
 * `turbo run dev` from the repo root, a VS Code task with a different cwd, or a test
 * runner. When it breaks it does not throw — it resolves to a directory *outside* the
 * repository, so the dashboard silently seeds a second, empty set of projects and the
 * real ones look lost.
 *
 * Anchoring on the workspace marker instead makes the location independent of cwd.
 */

/** Walks up from `start` until it finds the pnpm workspace marker. */
function findWorkspaceRoot(start: string): string | null {
  let dir = path.resolve(start);

  for (;;) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Resolution order:
 * 1. `SEGEVISION_DATA_ROOT` — an absolute path. This is the hook a hosted environment
 *    uses to point at a mounted volume, and the escape hatch when the layout changes.
 * 2. The workspace root, discovered by walking up for `pnpm-workspace.yaml`.
 * 3. The current working directory, so a standalone copy still starts rather than
 *    crashing at import time.
 */
function resolveDataRoot(): string {
  const override = process.env.SEGEVISION_DATA_ROOT;
  if (override) return path.resolve(override);

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  return path.join(workspaceRoot ?? process.cwd(), '.data');
}

export const DATA_ROOT = resolveDataRoot();
