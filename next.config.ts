import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mi4zmnfrbx.ufs.sh",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase from default 1MB to handle larger payloads
    },
  },
};

export default nextConfig;
