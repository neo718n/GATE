import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "@aws-sdk/lib-storage"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f2dcb2bc241340699d740b25ab172313.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
