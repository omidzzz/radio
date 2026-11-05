import type { NextConfig } from "next";
const isDev = process.env.NODE_ENV === "development";

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://fonts.googleapis.com"
  : "'self' 'unsafe-inline' https://www.googletagmanager.com https://fonts.googleapis.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/fa/",
        permanent: true,
      },
    ];
  },
  outputFileTracingRoot: process.cwd(),
  // `output: "export"` (static HTML export) is incompatible with Next.js
  // middleware: the dev server cannot run middleware in this output mode,
  // which causes the dev server to restart in a loop and the page to keep
  // refreshing. The static export is only needed at production build time,
  // so keep it there and run the full server rendering during development
  // so middleware (locale routing) works correctly and the page does not loop.
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
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
