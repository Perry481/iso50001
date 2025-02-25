import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  // Change assetPrefix to include /ebc in production
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/ebc/iso50001" : "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
