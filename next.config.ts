import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["echarts", "echarts-for-react"],
  // Add this to suppress specific hydration warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },

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
      // Future i18n routes (commented out for now)
      // {
      //   source: "/:locale(en|zh-TW)/:company",
      //   destination: "/:locale",
      // },
      // {
      //   source: "/:locale(en|zh-TW)/:company/:path*",
      //   destination: "/:locale/:path*",
      // },
    ];
  },
};

export default nextConfig;
