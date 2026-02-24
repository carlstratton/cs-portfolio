import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack uses this repo root even if other lockfiles exist above.
    root: process.cwd(),
  },
};

export default nextConfig;
