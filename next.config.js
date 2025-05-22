/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/universe-explorer-3d",
  assetPrefix: "/universe-explorer-3d/",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
