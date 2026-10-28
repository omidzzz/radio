import type { NextConfig } from "next";
const isDev = process.env.NODE_ENV === "development";

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://fonts.googleapis.com"
  : "'self' 'unsafe-inline' https://www.googletagmanager.com https://fonts.googleapis.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
  },
  webpack(config) {
    // Allow importing SVG (or any file) as raw text via the ?raw suffix
    // needed by MriMachineIllustration which inlines an animated SVG.
    // Put our raw-SVG rule BEFORE Next.js built-in SVG rules so ?raw imports
    // resolve to plain text instead of being processed as image assets.
    config.module.rules.unshift({
      test: /\.svg$/i,
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
