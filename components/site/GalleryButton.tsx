"use client";

// A "View our gallery" button that opens the Our Home photos in a full-screen lightbox
// (prev/next, keyboard arrows, ESC/backdrop to close).

import { useEffect, useState } from "react";
import type { GalleryImageRow } from "@/lib/data/gallery";

export function GalleryButton({ images }: { images: GalleryImageRow[] }) {
  const n = images.length;
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
      else if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, n]);

  if (!n) return null;
  const img = images[Math.min(i, n - 1)]!;
  const arrow =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-2xl text-white/90 transition-colors hover:border-white hover:bg-white/10";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-brand-600 px-6 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
            clipRule="evenodd"
          />
        </svg>
        View our gallery
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/90 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {i + 1} / {n}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="rounded-full px-3 text-3xl leading-none text-white/80 hover:text-white"
            >
              &times;
            </button>
          </div>

          <div
            className="flex flex-1 items-center justify-center gap-3 overflow-hidden py-4 sm:gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {n > 1 ? (
              <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} aria-label="Previous photo" className={arrow}>
                ‹
              </button>
            ) : null}
            <figure className="flex min-w-0 flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="max-h-[74vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
              {img.caption ? (
                <figcaption className="mt-3 max-w-xl text-center text-sm text-white/80">
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
            {n > 1 ? (
              <button type="button" onClick={() => setI((v) => (v + 1) % n)} aria-label="Next photo" className={arrow}>
                ›
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
