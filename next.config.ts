import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
