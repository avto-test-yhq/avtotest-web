const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'api.pravachi.uz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.pravachi.uz',
        pathname: '/rules/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/rules/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/rules/**',
      },
    ],
    unoptimized: false, // External images uchun unoptimized prop ishlatiladi
  },
}

module.exports = nextConfig
