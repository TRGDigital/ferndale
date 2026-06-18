"use client";

// Drop-in for next/image with managed alt text. Resolution order:
//   1. an explicit `alt` prop (always wins — for truly fixed alt)
//   2. the managed alt for this src from <AltMapProvider> (set in the admin)
//   3. `fallbackAlt` — the code default for this image (admin override wins)
//   4. "" (decorative fallback — never undefined, so next/image stays happy)
//
// Use this everywhere instead of a bare <img> (SEO convention). Pass the code
// default as `fallbackAlt` (not `alt`) so the admin can override it.

import Image, { type ImageProps } from "next/image";
import { useAltMap } from "@/components/AltMapProvider";

type SiteImageProps = Omit<ImageProps, "alt"> & {
  alt?: string;
  fallbackAlt?: string;
};

export function SiteImage({ src, alt, fallbackAlt, ...rest }: SiteImageProps) {
  const map = useAltMap();
  const key = typeof src === "string" ? src : "";
  const resolvedAlt = alt ?? map[key] ?? fallbackAlt ?? "";
  return <Image src={src} alt={resolvedAlt} {...rest} />;
}
