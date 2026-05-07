import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
  allowedDevOrigins:["192.168.137.97"]
};

export default nextConfig;
