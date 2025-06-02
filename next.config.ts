import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化 Hydration 处理
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // 启用严格模式
  reactStrictMode: true,
  
  // 优化图片处理
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 性能优化
  poweredByHeader: false,
  
  // 压缩配置
  compress: true,
};

export default nextConfig;
