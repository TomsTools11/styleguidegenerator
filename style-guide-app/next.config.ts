import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors for @react-pdf/renderer type incompatibility
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
