/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cms/shared'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
    ],
  },
}

module.exports = nextConfig
