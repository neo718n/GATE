import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "@aws-sdk/lib-storage"],
};

export default nextConfig;
