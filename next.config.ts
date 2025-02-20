import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001", // Add this line
  transpilePackages: ["echarts", "echarts-for-react"],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  async rewrites() {
    return [
      // Handle root company route
      {
        source: "/:company",
        destination: "/",
      },
      // Handle all company sub-routes
      {
        source: "/:company/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
