import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // SPA fallback: rewrite all non-API, non-static routes to index page
  // This allows client-side Zustand routing for /browse, /cart, /admin, /fr/*, etc.
  // IMPORTANT: sw.js, manifest.json, offline.html must NOT be caught by rewrites
  async rewrites() {
    return [
      {
        source: "/((?!api|_next|_vercel|icon|apple-icon|logo|marker-icon|robots|favicon|sitemap|sw|manifest|offline).*)",
        destination: "/",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
