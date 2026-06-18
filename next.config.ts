import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hard rule #1: old WordPress URLs all have trailing slashes — match them exactly.
  trailingSlash: true,
  // Hard rule #6: images live in Supabase Storage, never the WP host.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trmwjilicdxgrzbwzchf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
