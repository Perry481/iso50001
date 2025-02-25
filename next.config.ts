import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/iso50001",
  assetPrefix: "/iso50001",
  transpilePackages: ["echarts", "echarts-for-react"],
  // Comment out any rewrites temporarily
  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       // This handles company-specific paths
  //       {
  //         source: "/:company/iso50001/:path*",
  //         destination: "/iso50001/:path*",
  //       },
  //     ],
  //     afterFiles: [],
  //     fallback: [],
  //   };
  // },
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
};

export default nextConfig;
