/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = {
  swcMinify: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.TIMEOUT': JSON.stringify('60000'), // 60 seconds
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;