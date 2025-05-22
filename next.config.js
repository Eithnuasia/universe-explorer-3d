/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Comment these out for local development
  // basePath: "/universe-explorer-3d",
  // assetPrefix: "/universe-explorer-3d/",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
