"use client";

import { useEffect, useState } from "react";
import type { ReviewRow } from "@/lib/data/reviews";

// Auto-rotating, accessible testimonial carousel for the homepage. Renders featured reviews on a
// dark (brand) background — white text.
export function ReviewCarousel({ reviews }: { reviews: ReviewRow[] }) {
  const n = reviews.length;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 8000);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;
  const r = reviews[Math.min(i, n - 1)]!;

  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-lg text-white/80 transition-colors hover:border-white hover:text-white";

  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <div className="flex justify-center gap-0.5 text-xl" aria-hidden>
        <span className="text-brand-accent">{"★".repeat(r.rating)}</span>
        <span className="text-white/25">{"★".repeat(5 - r.rating)}</span>
      </div>
      {r.title ? (
        <p className="mt-4 font-serif text-xl text-white">{r.title}</p>
      ) : null}
      <blockquote className="mt-4 text-lg font-medium leading-relaxed text-white sm:text-xl">
        &ldquo;{r.body}&rdquo;
      </blockquote>
      <p className="mt-5 text-sm text-brand-50">
        {r.author}
        {r.relationship ? <span className="text-brand-100/80">, {r.relationship}</span> : null}
      </p>

      {n > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} aria-label="Previous review" className={arrow}>
            ‹
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Show review ${k + 1}`}
                aria-current={k === i}
                className={`h-2 w-2 rounded-full transition-colors ${k === i ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => setI((v) => (v + 1) % n)} aria-label="Next review" className={arrow}>
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
