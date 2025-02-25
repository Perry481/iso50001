import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  assetPrefix: "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],
  // Add rewrites to handle company paths properly
  async rewrites() {
    return [
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
