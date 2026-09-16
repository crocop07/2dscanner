import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static exports on GitHub Pages
  },
  // Only use the subpath when building for production/GitHub Pages
  basePath: isProd ? '/2dscanner' : '',
};

export default nextConfig;