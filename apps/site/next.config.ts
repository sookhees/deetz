import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@deetz/ui"],
  // Lets a phone on the same network reach the dev server, hot reload included.
  allowedDevOrigins: ["192.168.*.*"],
}

export default nextConfig
