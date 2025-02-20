import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["echarts", "echarts-for-react"],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  async rewrites() {
    return [
      // Legacy/direct routes
      {
        source: "/iso50001",
        destination: "/",
      },
      {
        source: "/iso50001/energy-ecf",
        destination: "/energy-ecf",
      },
      {
        source: "/iso50001/org-energy-usage",
        destination: "/org-energy-usage",
      },
      {
        source: "/iso50001/area-settings",
        destination: "/area-settings",
      },
      {
        source: "/iso50001/energy-subject-settings",
        destination: "/energy-subject-settings",
      },
      {
        source: "/iso50001/energy-equipment",
        destination: "/energy-equipment",
      },
      {
        source: "/iso50001/energy-review",
        destination: "/energy-review",
      },
      {
        source: "/iso50001/seu",
        destination: "/seu",
      },
      {
        source: "/iso50001/enb",
        destination: "/enb",
      },
      {
        source: "/iso50001/enpi",
        destination: "/enpi",
      },

      // Handle general path pattern
      {
        source: "/:company/iso50001/:path*",
        destination: "/:path*",
      },
      {
        source: "/iso50001/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
