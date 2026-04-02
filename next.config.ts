import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // SPA fallback: rewrite all non-API, non-static routes to index page
  // This allows client-side Zustand routing for /browse, /cart, /admin, /fr/*, etc.
  async rewrites() {
    return [
      {
        source: "/((?!api|_next|_vercel|icon|apple-icon|logo|marker-icon|robots|favicon|sitemap).*)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
