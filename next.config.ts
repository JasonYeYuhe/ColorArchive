import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  async redirects() {
    return [
      { source: "/packs", destination: "/pro/", permanent: true },
      { source: "/packs/", destination: "/pro/", permanent: true },
      { source: "/packs/:slug", destination: "/pro/", permanent: true },
      { source: "/packs/:slug/", destination: "/pro/", permanent: true },
      { source: "/free-pack", destination: "/free-resources/", permanent: true },
      { source: "/free-pack/", destination: "/free-resources/", permanent: true },
    ];
  },
};

export default nextConfig;
