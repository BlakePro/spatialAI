/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    author: 'Cristian Yosafat Hernández Ruiz',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  }
}
export default nextConfig;
