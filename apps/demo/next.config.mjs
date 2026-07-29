/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@segevision/ui',
    '@segevision/tokens',
    '@segevision/core',
    '@segevision/icons',
    '@segevision/hooks',
    '@segevision/utils',
  ],
  reactStrictMode: true,
};

export default nextConfig;
