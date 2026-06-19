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
import { SHOW_IMAGE_PLACEHOLDERS } from "@/lib/flags";

type SiteImageProps = Omit<ImageProps, "alt"> & {
  alt?: string;
  fallbackAlt?: string;
};

export function SiteImage({ src, alt, fallbackAlt, ...rest }: SiteImageProps) {
  const map = useAltMap();
  const key = typeof src === "string" ? src : "";
  const resolvedAlt = alt ?? map[key] ?? fallbackAlt ?? "";

  if (SHOW_IMAGE_PLACEHOLDERS) {
    const { fill, className } = rest as { fill?: boolean; className?: string };
    return (
      <span
        role="img"
        aria-label={`Image to be added: ${resolvedAlt}`}
        className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-brand-300 bg-sand/70 p-3 text-center ${
          fill ? "absolute inset-0" : "aspect-[16/10] w-full"
        } ${className ?? ""}`}
      >
        <span className="text-xs font-semibold text-brand-700/80">
          📷 Image to be added
        </span>
        <span className="max-w-[24rem] text-[0.7rem] leading-tight text-muted">
          {resolvedAlt}
        </span>
      </span>
    );
  }

  return <Image src={src} alt={resolvedAlt} {...rest} />;
}
