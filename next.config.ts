import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/badge-3d-demo.html", destination: "/badge-demo", permanent: false },
    ];
  },
  turbopack: {
    // Ensure Turbopack uses this repo root even if other lockfiles exist above.
    root: process.cwd(),
  },
  experimental: {
    // Persist Turbopack cache to disk for faster dev restarts
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
