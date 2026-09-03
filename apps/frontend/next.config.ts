import type { NextConfig } from "next";
import { resolve } from "node:path";

const backendUrl = process.env.BACKEND_API_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(import.meta.dirname, "..", ".."),
  },
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
