import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static exports on GitHub Pages
  },
  basePath: '/2dscanner', // ONLY uncomment if hosted at username.github.io/2dscanner/ without a custom domain
};

export default nextConfig;