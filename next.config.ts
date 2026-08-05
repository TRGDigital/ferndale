import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hard rule #1: old WordPress URLs all have trailing slashes — match them exactly.
  trailingSlash: true,
  // Canonical host: everything 308s to the bare branded domain so search engines
  // index one URL per page (www and the Vercel staging URL both redirect).
  async redirects() {
    return ["www.ferndalenursinghome.co.uk", "ferndale-ochre.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://ferndalenursinghome.co.uk/:path*",
      permanent: true,
    }));
  },
  // Allow photo uploads through server actions (the admin Gallery upload); default is 1MB.
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  // Hard rule #6: images live in Supabase Storage, never the WP host.
  images: {
    remotePatterns: [
      {
        // Ferndale's own Supabase storage.
        protocol: "https",
        hostname: "nuxsbykzkivbjtkhheph.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Crossways bucket — placeholder images carried over from the clone.
        protocol: "https",
        hostname: "trmwjilicdxgrzbwzchf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
