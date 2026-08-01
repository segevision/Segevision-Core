import { expect, test } from '@playwright/test';

/**
 * The authentication boundary.
 *
 * Everything here runs without a session, so it needs no Supabase data — only the Auth
 * service, and only to be told "no". These are the checks that would catch the worst
 * possible regression in this migration: a protected route quietly becoming public.
 */

const PROTECTED_PAGES = ['/', '/new', '/projects/prj_physiothletics', '/preview'];

test.describe('unauthenticated access', () => {
  for (const path of PROTECTED_PAGES) {
    test(`${path} redirects to the login page`, async ({ page }) => {
      const response = await page.goto(path);

      expect(new URL(page.url()).pathname).toBe('/login');
      // The destination is preserved, so signing in returns to the same place.
      expect(new URL(page.url()).searchParams.get('next')).toBe(path);
      expect(response?.status()).toBe(200);
    });
  }

  test('project API answers 401 in JSON, never an HTML login page', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(401);
    expect(response.headers()['content-type']).toContain('application/json');
    // An HTML redirect here is the bug this asserts against: the editor's fetch layer
    // would report a JSON parse error instead of "please sign in".
    expect(await response.json()).toHaveProperty('error');
  });

  test('a single project cannot be read without a session', async ({ request }) => {
    const response = await request.get('/api/projects/prj_physiothletics');
    expect(response.status()).toBe(401);
  });

  test('media upload cannot be reached without a session', async ({ request }) => {
    const response = await request.post('/api/media', { multipart: { projectId: 'x' } });
    expect(response.status()).toBe(401);
  });

  test('media bytes cannot be read without a session', async ({ request }) => {
    const response = await request.get(
      '/api/media/prj_physiothletics/13cb2092-7428-4b3b-8476-40e603d816b0.png',
    );
    expect(response.status()).toBe(401);
  });
});

test.describe('login page', () => {
  test('is Hebrew, right-to-left, and complete', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');

    await expect(page.getByRole('heading', { name: 'התחברות לפלטפורמה' })).toBeVisible();
    await expect(page.getByLabel('כתובת אימייל')).toBeVisible();
    await expect(page.getByLabel('סיסמה', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחברות' })).toBeVisible();

    // Latin-content fields stay LTR inside the RTL page, or the caret lands in the wrong
    // place on every keystroke.
    await expect(page.getByLabel('כתובת אימייל')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByLabel('סיסמה', { exact: true })).toHaveAttribute('dir', 'ltr');
  });

  test('does not offer self sign-up', async ({ page }) => {
    await page.goto('/login');
    // The platform is private. A sign-up affordance appearing here would be a policy
    // regression, not a UI change.
    await expect(page.getByRole('button', { name: /הרשמה|יצירת חשבון/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /הרשמה|יצירת חשבון/ })).toHaveCount(0);
  });

  test('rejects wrong credentials with a Hebrew message and no leak', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('כתובת אימייל').fill('nobody@segevision.invalid');
    await page.getByLabel('סיסמה', { exact: true }).fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'התחברות' }).click();

    // Scoped to the form: Next renders its own role="alert" route announcer on every page,
    // so an unscoped getByRole('alert') matches two elements and resolves the wrong one.
    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toHaveText('האימייל או הסיסמה שגויים.');

    // Still on /login, and no session was created.
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test('renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'התחברות לפלטפורמה' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('the form fits its viewport without horizontal scroll', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'התחברות' })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
