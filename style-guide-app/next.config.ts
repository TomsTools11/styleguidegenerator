import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors for @react-pdf/renderer type incompatibility
  typescript: {
    ignoreBuildErrors: true,
  },

  // Keep the Chromium loader out of the Next.js bundle. @sparticuz/chromium-min
  // resolves a remote tarball to /tmp at runtime; if Webpack rewrites its
  // require()s the path resolution breaks. playwright-core has the same need.
  serverExternalPackages: ['@sparticuz/chromium-min', 'playwright-core'],
};

export default nextConfig;
