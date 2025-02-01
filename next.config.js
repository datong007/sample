/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
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
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    PORT: process.env.PORT || 3000,
  },
  output: 'standalone',
  serverOptions: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
}

module.exports = nextConfig 