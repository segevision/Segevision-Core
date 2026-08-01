import { expect, test, type Page } from '@playwright/test';

/**
 * Responsive layout and floating-UI behaviour on the dashboard.
 *
 * Signed in, because the dashboard is. Skipped unless PLATFORM_TEST_EMAIL and
 * PLATFORM_TEST_PASSWORD are set:
 *
 *   PLATFORM_TEST_EMAIL=… PLATFORM_TEST_PASSWORD=… pnpm e2e:platform
 *
 * Everything here is read-only — it opens menus and measures geometry, and never creates,
 * edits or deletes a project. Safe to point at any environment, including production.
 *
 * The two regressions it exists to catch:
 *   1. the action menu being clipped by its own card's `overflow-hidden`, and
 *   2. the menu opening downward off the bottom of the viewport instead of flipping.
 */

const EMAIL = process.env.PLATFORM_TEST_EMAIL;
const PASSWORD = process.env.PLATFORM_TEST_PASSWORD;

test.skip(!EMAIL || !PASSWORD, 'Set PLATFORM_TEST_EMAIL and PLATFORM_TEST_PASSWORD to run.');

/** viewport -> the number of grid tracks the dashboard must render at that width. */
const MATRIX = [
  { width: 1600, height: 1000, columns: 3 },
  { width: 1440, height: 900, columns: 3 },
  { width: 1280, height: 800, columns: 2 },
  { width: 1180, height: 820, columns: 2 },
  { width: 1024, height: 768, columns: 2 },
  { width: 834, height: 1194, columns: 2 },
  { width: 768, height: 1024, columns: 2 },
  { width: 430, height: 932, columns: 1 },
  { width: 390, height: 844, columns: 1 },
];

const MENU = '[role="menu"]';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('כתובת אימייל').fill(EMAIL!);
  await page.getByLabel('סיסמה').fill(PASSWORD!);
  await page.getByRole('button', { name: 'התחברות' }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
  await page.waitForSelector('main ul.grid li', { timeout: 20_000 });
}

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('dashboard responsive', () => {
  for (const size of MATRIX) {
    test(`${size.width}x${size.height}: ${size.columns} column(s), no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await signIn(page);

      // The track count, not the card count: a status group holding a single card would
      // otherwise read as "one column" at every width.
      const columns = await page.evaluate(() => {
        const grids = Array.from(document.querySelectorAll('main ul.grid'));
        const widest = grids.reduce((a, b) => (b.children.length > a.children.length ? b : a));
        return getComputedStyle(widest).gridTemplateColumns.split(' ').filter(Boolean).length;
      });
      expect(columns).toBe(size.columns);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('project action menu', () => {
  test('flips upward when the trigger sits at the bottom edge', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);

    const triggers = page.locator('main ul.grid li button[aria-haspopup="menu"]');
    const last = triggers.nth((await triggers.count()) - 1);

    // Park the trigger 30px above the bottom, so a downward menu cannot fit.
    await last.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy(0, rect.bottom - window.innerHeight + 30);
    });
    await last.click();
    await page.waitForSelector(MENU);

    const geometry = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"]')!.getBoundingClientRect();
      const trigger = document
        .querySelector('main ul.grid li button[aria-haspopup="menu"][aria-expanded="true"]')!
        .getBoundingClientRect();
      return {
        flippedUp: menu.bottom <= trigger.top + 1,
        inside:
          menu.top >= 0 &&
          menu.left >= 0 &&
          menu.bottom <= window.innerHeight &&
          menu.right <= window.innerWidth,
      };
    });

    expect(geometry.flippedUp).toBe(true);
    expect(geometry.inside).toBe(true);
  });

  test('opens downward, and is never clipped by its card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);

    const trigger = page.locator('main ul.grid li button[aria-haspopup="menu"]').first();
    await trigger.click();
    await page.waitForSelector(MENU);

    const result = await page.evaluate(() => {
      const menuEl = document.querySelector('[role="menu"]')!;
      const menu = menuEl.getBoundingClientRect();
      const triggerEl = document.querySelector(
        'main ul.grid li button[aria-haspopup="menu"][aria-expanded="true"]',
      )!;
      return {
        downward: menu.top >= triggerEl.getBoundingClientRect().top,
        // The proof it escaped the card: the menu is not a descendant of any <li>.
        outsideCard: menuEl.closest('li') === null,
        inside: menu.bottom <= window.innerHeight && menu.top >= 0,
      };
    });

    expect(result.downward).toBe(true);
    expect(result.outsideCard).toBe(true);
    expect(result.inside).toBe(true);
  });

  test('stays inside the viewport while scrolling and resizing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);

    const trigger = page.locator('main ul.grid li button[aria-haspopup="menu"]').first();
    await trigger.click();
    await page.waitForSelector(MENU);

    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(250);
    await expect(page.locator(MENU)).toBeVisible();

    await page.setViewportSize({ width: 900, height: 620 });
    await page.waitForTimeout(300);

    const inside = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"]')?.getBoundingClientRect();
      if (!menu) return false;
      return menu.top >= 0 && menu.bottom <= window.innerHeight && menu.right <= window.innerWidth;
    });
    expect(inside).toBe(true);
  });

  test('keyboard: arrows navigate, Escape closes, focus returns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);

    const trigger = page.locator('main ul.grid li button[aria-haspopup="menu"]').first();
    await trigger.click();
    await page.waitForSelector(MENU);

    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe(
      'menuitem',
    );

    await page.keyboard.press('Escape');
    await expect(page.locator(MENU)).toHaveCount(0);
    // Focus must land back on the trigger, not at the top of the document.
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-haspopup'))).toBe(
      'menu',
    );
  });

  test('outside click closes it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);

    const trigger = page.locator('main ul.grid li button[aria-haspopup="menu"]').first();
    await trigger.click();
    await page.waitForSelector(MENU);
    await page.mouse.click(8, 8);
    await expect(page.locator(MENU)).toHaveCount(0);
  });
});
