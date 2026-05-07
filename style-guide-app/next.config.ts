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

  // Force-include Lato fonts and brand images into the PDF route's serverless
  // bundle. @react-pdf/renderer reads them from disk via process.cwd(); without
  // this, Vercel's static-asset CDN has them but the lambda doesn't.
  outputFileTracingIncludes: {
    '/api/generate-pdf': [
      './public/fonts/Lato-Light.ttf',
      './public/fonts/Lato-Regular.ttf',
      './public/fonts/Lato-Italic.ttf',
      './public/fonts/Lato-Bold.ttf',
      './public/fonts/Lato-Black.ttf',
      './public/brand/stylesnap-logo.png',
      './public/brand/stylesnap-logo-light.png',
    ],
  },
};

export default nextConfig;
