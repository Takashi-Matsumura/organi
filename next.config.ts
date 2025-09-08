import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel最適化設定
  output: 'standalone',
  experimental: {
    // Vercelでの最適化
    optimizePackageImports: ['react-icons'],
  },
  // 静的ファイルの設定
  trailingSlash: false,
  // 画像最適化（必要に応じて）
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
