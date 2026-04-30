import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors for @react-pdf/renderer type incompatibility
  typescript: {
    ignoreBuildErrors: true,
  },

  // Keep the Chromium binary out of the Next.js bundle. @sparticuz/chromium
  // ships a brotli-compressed binary that needs to be `require`d at runtime
  // from node_modules — bundling breaks it. playwright-core has the same need.
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],
};

export default nextConfig;
