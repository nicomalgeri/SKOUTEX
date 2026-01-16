import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sportmonks.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
