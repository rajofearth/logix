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
};

export default nextConfig;
