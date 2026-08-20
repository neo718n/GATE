import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner", "@aws-sdk/lib-storage"],
  // badge-card-pdf.tsx reads event_badge/assets/*.png|jpg via fs.readFileSync
  // with a process.cwd()-based path at runtime — Next's file tracer can't
  // always resolve that statically, so the asset directory is included
  // explicitly to make sure it actually ships in the deployed function.
  outputFileTracingIncludes: {
    "/api/admin/badges/export": ["./event_badge/assets/**"],
  },
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
