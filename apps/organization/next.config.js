/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercelでの最適化
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // 静的ファイルの設定
  trailingSlash: false,
};

module.exports = nextConfig;