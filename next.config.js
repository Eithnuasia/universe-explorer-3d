/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Set basePath and assetPrefix only in production (GitHub Pages)
  basePath:
    process.env.NODE_ENV === "production" ? "/universe-explorer-3d" : "",
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/universe-explorer-3d/" : "",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
