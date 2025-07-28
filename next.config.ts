import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},  // 注意这里是空对象，不是true
  },
};

export default nextConfig;
