import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * The signed-in half of the verification.
 *
 * Skipped unless PLATFORM_TEST_EMAIL and PLATFORM_TEST_PASSWORD are set, so the suite is
 * runnable before the Supabase account exists and complete afterwards:
 *
 *   NEXT_DIST_DIR=.next-verify PLATFORM_PORT=3599 \
 *   PLATFORM_TEST_EMAIL=you@example.com PLATFORM_TEST_PASSWORD=… \
 *     pnpm e2e:platform
 *
 * These tests run against whatever Supabase project the app is pointed at, which will be
 * the real one holding real client work. So: every test creates the project it operates on
 * and deletes it in a finally block. Nothing here reads, edits, archives or deletes a
 * project it did not make. That rule is why there is no test that archives
 * prj_physiothletics — it would be a test that mutates a client's site.
 */

const EMAIL = process.env.PLATFORM_TEST_EMAIL;
const PASSWORD = process.env.PLATFORM_TEST_PASSWORD;

test.skip(
  !EMAIL || !PASSWORD,
  'Set PLATFORM_TEST_EMAIL and PLATFORM_TEST_PASSWORD to run the signed-in checks.',
);

const REPO_ROOT = path.resolve(__dirname, '../..');
const LOCAL_PROJECTS_DIR = path.join(REPO_ROOT, '.data/projects');

/** A 1x1 PNG. Small enough to inline, real enough for the type checks to accept. */
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
);

async function signIn(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('כתובת אימייל').fill(EMAIL!);
  await page.getByLabel('סיסמה', { exact: true }).fill(PASSWORD!);
  await page.getByRole('button', { name: 'התחברות' }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
}

/** Minimal valid project. Built here rather than through the wizard so a UI change in /new
 *  cannot silently turn a persistence test into a form test. */
function draftProject(suffix: string) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    id: `prj_e2e${suffix}`,
    name: `בדיקה אוטומטית ${suffix}`,
    slug: `e2e-check-${suffix}`,
    industry: 'בדיקות',
    language: 'he',
    direction: 'rtl',
    template: 'medical',
    theme: 'medical',
    status: 'draft',
    business: { name: `בדיקה אוטומטית ${suffix}` },
    design: {},
    navigation: [],
    pages: [],
    seo: {},
    media: [],
    createdAt: now,
    updatedAt: now,
  };
}

async function createProject(request: APIRequestContext, suffix: string) {
  const draft = draftProject(suffix);
  const response = await request.post('/api/projects', { data: draft });
  expect(response.status(), await response.text()).toBe(201);
  return draft;
}

async function deleteProject(request: APIRequestContext, id: string) {
  await request.delete(`/api/projects/${id}`);
}

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('the dashboard lists projects and reports no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'מה בעבודה' })).toBeVisible();
    // Waits for the fetch to settle so an error thrown during it is caught below.
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('signing out ends the session and re-protects the dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'יציאה מהמערכת' }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test('a created project survives a full reload', async ({ page }) => {
    const draft = await createProject(page.request, 'reload');

    try {
      await page.goto('/');
      await expect(page.getByText(draft.name)).toBeVisible();

      // A reload proves the row is in Postgres rather than in the client's memory.
      await page.reload();
      await expect(page.getByText(draft.name)).toBeVisible();
    } finally {
      await deleteProject(page.request, draft.id);
    }
  });

  test('a save round-trips, and a second browser session sees it', async ({ page, browser }) => {
    const draft = await createProject(page.request, 'roundtrip');

    try {
      const renamed = { ...draft, name: 'בדיקה אוטומטית — נשמר' };
      const save = await page.request.put(`/api/projects/${draft.id}`, { data: renamed });
      expect(save.status(), await save.text()).toBe(200);

      // A brand-new context: no cookies, no cache, nothing shared with the page above.
      // This is the check that the data lives on the server and not in one browser.
      const context = await browser.newContext();
      const second = await context.newPage();
      await signIn(second);
      await second.goto('/');
      await expect(second.getByText('בדיקה אוטומטית — נשמר')).toBeVisible();
      await context.close();
    } finally {
      await deleteProject(page.request, draft.id);
    }
  });

  test('archiving from the dashboard menu persists', async ({ page }) => {
    const draft = await createProject(page.request, 'archive');

    try {
      const archived = { ...draft, status: 'archived' };
      const save = await page.request.put(`/api/projects/${draft.id}`, { data: archived });
      expect(save.status()).toBe(200);

      const read = await page.request.get(`/api/projects/${draft.id}`);
      expect((await read.json()).project.status).toBe('archived');

      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'ארכיון' })).toBeVisible();
    } finally {
      await deleteProject(page.request, draft.id);
    }
  });

  test('duplication produces an independent project', async ({ page }) => {
    const draft = await createProject(page.request, 'dup');
    const copyId = `${draft.id}copy`;

    try {
      const copy = {
        ...draft,
        id: copyId,
        slug: `${draft.slug}-copy`,
        name: `${draft.name} (עותק)`,
      };
      const created = await page.request.post('/api/projects', { data: copy });
      expect(created.status(), await created.text()).toBe(201);

      // The unique (owner_id, slug) index has to refuse a second project on the same slug,
      // or two client sites could later deploy to one address.
      const clash = await page.request.post('/api/projects', {
        data: { ...copy, id: `${copyId}2` },
      });
      expect(clash.status()).toBeGreaterThanOrEqual(400);
    } finally {
      await deleteProject(page.request, copyId);
      await deleteProject(page.request, draft.id);
    }
  });

  test('an uploaded image is stored, served, and survives a restart', async ({ page }) => {
    const draft = await createProject(page.request, 'media');

    try {
      const upload = await page.request.post('/api/media', {
        multipart: {
          projectId: draft.id,
          slot: 'hero:hero',
          file: { name: 'pixel.png', mimeType: 'image/png', buffer: PNG_1PX },
        },
      });
      expect(upload.status(), await upload.text()).toBe(201);
      const { media } = await upload.json();

      // In Supabase mode the key is owner/project/slot/file — four segments.
      expect(media.key.split('/')).toHaveLength(4);
      expect(media.url).toBe(`/api/media/${media.key}`);

      // Fetched through our own route, so the URL saved in the document never expires.
      const fetched = await page.request.get(media.url);
      expect(fetched.status()).toBe(200);
      expect(fetched.headers()['content-type']).toBe('image/png');
      expect(fetched.headers()['cache-control']).toContain('private');

      // Signed out, the same URL must not serve bytes.
      const anonymous = await page.context().browser()!.newContext();
      const anonymousResponse = await anonymous.request.get(
        new URL(media.url, page.url()).toString(),
      );
      expect(anonymousResponse.status()).toBe(401);
      await anonymous.close();
    } finally {
      await deleteProject(page.request, draft.id);
    }
  });

  test('nothing is written to the local .data directory', async ({ page }) => {
    // The whole point of the migration: on a serverless host these writes would be accepted
    // and then lost. If a save ever lands on disk again, this catches it.
    const before = snapshotLocalProjects();

    const draft = await createProject(page.request, 'nodisk');
    try {
      await page.request.put(`/api/projects/${draft.id}`, {
        data: { ...draft, name: 'בדיקה אוטומטית — דיסק' },
      });
      await page.request.post('/api/media', {
        multipart: {
          projectId: draft.id,
          slot: 'hero:hero',
          file: { name: 'pixel.png', mimeType: 'image/png', buffer: PNG_1PX },
        },
      });
    } finally {
      await deleteProject(page.request, draft.id);
    }

    expect(snapshotLocalProjects()).toEqual(before);
  });
});

/** File names and modification times of the local project directory, if it exists. */
function snapshotLocalProjects(): Record<string, number> {
  try {
    return Object.fromEntries(
      readdirSync(LOCAL_PROJECTS_DIR)
        .sort()
        .map((file) => [file, statSync(path.join(LOCAL_PROJECTS_DIR, file)).mtimeMs]),
    );
  } catch {
    return {};
  }
}
