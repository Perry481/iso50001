// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  assetPrefix: "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],

  // Simpler rewrites configuration
  async rewrites() {
    return {
      beforeFiles: [
        // Fix double paths if they occur
        {
          source: "/iso50001/iso50001/:path*",
          destination: "/iso50001/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
