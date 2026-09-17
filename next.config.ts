import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure the subpath starts with a '/' and matches your GitHub repo name exactly
  basePath: '/2dscanner',
  assetPrefix: '/2dscanner/',
  trailingSlash: true, // Guarantees clean static directory paths for GitHub Pages
};

export default nextConfig;