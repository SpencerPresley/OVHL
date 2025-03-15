import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // unoptimized: true,
    domains: [
      'media0.giphy.com',
      'media1.giphy.com',
      'media2.giphy.com',
      'media3.giphy.com',
      'media4.giphy.com',
      'media5.giphy.com',
      'media6.giphy.com',
      'media7.giphy.com',
      'media8.giphy.com',
      'media9.giphy.com',
      'media.giphy.com',
      'image.api.playstation.com',
    ],
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
