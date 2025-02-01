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
  env: {
    PORT: process.env.PORT || 3000,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
    UPLOAD_DIR: process.env.UPLOAD_DIR
  },
  output: 'standalone',
  serverOptions: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
}

module.exports = nextConfig 