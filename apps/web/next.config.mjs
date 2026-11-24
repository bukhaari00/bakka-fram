/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiPort = process.env.INTERNAL_API_PORT || '5001';
    return [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:${apiPort}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
