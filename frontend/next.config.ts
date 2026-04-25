import type { NextConfig } from "next";

const API_URL =
  process.env.API_URL ||
  "https://labour-by-hire-network-production.up.railway.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
