import type { NextConfig } from "next";

const projectRoot = new URL(".", import.meta.url).pathname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
};

export default nextConfig;
