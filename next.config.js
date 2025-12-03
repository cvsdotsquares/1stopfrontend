/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.6.25:3000/api',
  },
  // Allow cross-origin requests for network access
  allowedDevOrigins: [
    '192.168.6.25:3001',
    'localhost:3001',
    '127.0.0.1:3001',
    '192.168.6.*',
    '192.168.*.*'
  ],
  // Image optimization (updated to use remotePatterns)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '1stopinstruction.com',
        pathname: '/**',
      },
    ],
  },
  // Webpack configuration for better performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize memory usage
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
}

module.exports = nextConfig;