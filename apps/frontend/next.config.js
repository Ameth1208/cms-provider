/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cms/shared'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: 'cdn.amethgm.com' },
    ],
  },
}

module.exports = nextConfig
