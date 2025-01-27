/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/cart',
        destination: '/sample-list',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 