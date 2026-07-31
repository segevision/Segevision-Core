/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@segevision/ui',
    '@segevision/tokens',
    '@segevision/core',
    '@segevision/icons',
    '@segevision/hooks',
    '@segevision/utils',
    '@segevision/renderer',
    '@segevision/templates',
  ],
  reactStrictMode: true,

  /**
   * `next dev` and `next start` both own `.next`, so a running dev server continuously
   * overwrites a production build made beside it. The failure is deeply confusing: the
   * build reports success, then `next start` serves 500s for every rendered page while
   * middleware — already loaded in memory — keeps working.
   *
   * Setting NEXT_DIST_DIR gives a production build its own directory, so it can be built
   * and browser-verified without stopping the dev server:
   *
   *   NEXT_DIST_DIR=.next-verify pnpm --filter @segevision/platform build
   *   NEXT_DIST_DIR=.next-verify pnpm --filter @segevision/platform exec next start -p 3599
   *
   * Unset everywhere else, including on Vercel, which expects the default.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
