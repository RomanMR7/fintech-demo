import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db", "./prisma/schema.prisma"]
  }
};

export default nextConfig;
