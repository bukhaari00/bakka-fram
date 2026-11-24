/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://web-production-616215f8.up.railway.app/api'
  },
  async rewrites() {
    const remoteApi = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-616215f8.up.railway.app/api';
    const baseUrl = remoteApi.trim().replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
