import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  assetPrefix: "/ebc/iso50001", // This is crucial - put company in assetPrefix
  transpilePackages: ["echarts", "echarts-for-react"],
  // Add rewrites to handle the company path
  async rewrites() {
    return [
      {
        source: "/iso50001/ebc/iso50001/:path*",
        destination: "/iso50001/:path*",
      },
    ];
  },
  // Rest of config
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
