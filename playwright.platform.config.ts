import { defineConfig, devices } from '@playwright/test';

/**
 * Browser verification for the platform app.
 *
 * Separate from playwright.config.ts because that one drives the demo site on :3300. This
 * config builds nothing and assumes a production build exists —
 * `pnpm --filter @segevision/platform build` — so what it verifies is what would deploy.
 *
 *   pnpm e2e:platform                      # starts its own server on :3500
 *   PLATFORM_PORT=3599 pnpm e2e:platform   # anywhere else, e.g. beside a running dev server
 *   PLATFORM_URL=https://… pnpm e2e:platform   # against an already-running deployment
 *
 * The authenticated specs skip themselves unless PLATFORM_TEST_EMAIL and
 * PLATFORM_TEST_PASSWORD are set, so the suite is runnable before the Supabase account
 * exists and complete after it does.
 */
const port = process.env.PLATFORM_PORT ?? '3500';
const baseURL = process.env.PLATFORM_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e/platform',
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-platform' }]],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
  },
  // An external URL is somebody else's server; only a local run may start one.
  webServer: process.env.PLATFORM_URL
    ? undefined
    : {
        command: `pnpm --filter @segevision/platform exec next start -p ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
        // Inherited so NEXT_DIST_DIR reaches the server. `next dev` and `next start` both
        // own `.next`, so verifying a production build while a dev server runs requires the
        // build to live somewhere else — otherwise the dev server overwrites it and every
        // rendered page 500s while middleware keeps answering, which looks like an auth bug
        // and is not one.
        env: process.env.NEXT_DIST_DIR ? { NEXT_DIST_DIR: process.env.NEXT_DIST_DIR } : {},
      },
  /**
   * Three real viewports on Chromium.
   *
   * Deliberately not devices['iPhone 13'], which pins the engine to WebKit and makes the
   * suite fail on a machine that only has Chromium installed. The phone and tablet sizes
   * here are what the layout has to survive; a second rendering engine is a different kind
   * of testing and should not be the thing that stops this from running.
   */
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
});
