import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  // Don't hardcode company in assetPrefix
  assetPrefix: "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],
  // Use a more generic rewrite rule
  async rewrites() {
    return [
      {
        source: "/iso50001/:company/iso50001/:path*",
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
