"use client";

// Like <SiteImage> but renders a plain <img> — for logos, badges and avatars
// where next/image's fixed width/height would distort variable aspect ratios.
// Resolves managed alt the same way: explicit alt > managed map > fallbackAlt > "".

import type { ImgHTMLAttributes } from "react";
import { useAltMap } from "@/components/AltMapProvider";
import { SHOW_IMAGE_PLACEHOLDERS } from "@/lib/flags";

type ManagedImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  src: string;
  alt?: string;
  fallbackAlt?: string;
};

export function ManagedImg({ src, alt, fallbackAlt, ...rest }: ManagedImgProps) {
  const map = useAltMap();
  const resolved = alt ?? map[src] ?? fallbackAlt ?? "";

  if (SHOW_IMAGE_PLACEHOLDERS) {
    const { className } = rest as { className?: string };
    return (
      <span
        role="img"
        aria-label={`Image to be added: ${resolved}`}
        title={resolved}
        className={`inline-flex items-center justify-center border border-dashed border-brand-300 bg-sand/70 px-1.5 text-center text-[0.55rem] leading-tight text-muted ${className ?? ""}`}
      >
        {resolved.slice(0, 22)}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={resolved} {...rest} />;
}
