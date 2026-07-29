import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Segevision Core — demo app', () => {
  test('loads with RTL Hebrew by default and shows the foundation components', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'medical');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('מערכת העיצוב');
    await expect(page.getByRole('button', { name: /קביעת תור/ }).first()).toBeVisible();
  });

  test('theme switcher changes data-theme without a page reload', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('theme-select').selectOption('fitness');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'fitness');
  });

  test('mode toggle switches to dark mode', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('direction toggle switches to LTR', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('direction-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('buttons are keyboard reachable in document order', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab'); // theme select
    await page.keyboard.press('Tab'); // mode toggle
    await page.keyboard.press('Tab'); // direction toggle
    await page.keyboard.press('Tab'); // first CTA button in hero
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('BUTTON');
  });

  test('has no critical/serious automated accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const severe = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });
});
