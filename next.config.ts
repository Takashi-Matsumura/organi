import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelでの最適化
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // 静的ファイルの設定
  trailingSlash: false,
};

export default nextConfig;
