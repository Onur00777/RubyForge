import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["monaco-editor"],
  transpilePackages: ["@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
