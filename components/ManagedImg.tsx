"use client";

// Like <SiteImage> but renders a plain <img> — for logos, badges and avatars
// where next/image's fixed width/height would distort variable aspect ratios.
// Resolves managed alt the same way: explicit alt > managed map > fallbackAlt > "".

import type { ImgHTMLAttributes } from "react";
import { useAltMap } from "@/components/AltMapProvider";

type ManagedImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  src: string;
  alt?: string;
  fallbackAlt?: string;
};

export function ManagedImg({ src, alt, fallbackAlt, ...rest }: ManagedImgProps) {
  const map = useAltMap();
  const resolved = alt ?? map[src] ?? fallbackAlt ?? "";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={resolved} {...rest} />;
}
