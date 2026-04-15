/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* to the Python backend during local development.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
