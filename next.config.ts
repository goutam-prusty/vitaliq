import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    if (process.env.MOCK_AUTH === "true") {
      config.resolve.alias["@clerk/nextjs/server"] = path.resolve(__dirname, "./lib/mock-clerk-server.ts");
      config.resolve.alias["@clerk/nextjs"] = path.resolve(__dirname, "./lib/mock-clerk-client.ts");
    }
    return config;
  }
};

export default nextConfig;
