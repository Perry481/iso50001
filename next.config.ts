import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  assetPrefix: "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],

  // Using a more complete router configuration
  async rewrites() {
    return [
      // For development - fix double iso50001 paths
      {
        source: "/iso50001/iso50001/:path*",
        destination: "/iso50001/:path*",
      },
      // For production - handle the problematic double-path pattern
      {
        source: "/iso50001/:company/iso50001/:path*",
        destination: "/:company/iso50001/:path*",
      },
      // Make company path work with Next.js
      {
        source: "/:company/iso50001/:path*",
        destination: "/iso50001/:path*",
      },
    ];
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
