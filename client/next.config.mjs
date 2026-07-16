/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
  // ADD THIS REWRITES BLOCK:
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Replace with your ACTUAL Render backend URL! (Keep /api/:path* at the end)
        destination: "https://your-backend-name.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
