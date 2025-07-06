import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "media2.dev.to",
        port: "",
      },
      {
        protocol: "https",
        hostname: "flex.f6s.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
