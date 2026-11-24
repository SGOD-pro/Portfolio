import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "10.255.255.254",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "169.254.*.*",
    "*.local",
    "*.lan",
  ],
};

export default nextConfig;
