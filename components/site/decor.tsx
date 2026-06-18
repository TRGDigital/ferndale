// Shared colour accents + subtle decorative shapes.
//
// The original site (and our CareBeds landing pages) scatter little splashes of
// colour and soft shapes around. These helpers keep that tasteful and on-theme:
// pastel icon-chip / bullet accents, and soft blurred "blob" shapes that sit
// behind a section's content.

import type { CSSProperties } from "react";

// Soft pastel accents for icon chips (background + text + ring together).
export const CHIP_ACCENTS = [
  "bg-rose-100 text-rose-600 ring-rose-200",
  "bg-amber-100 text-amber-700 ring-amber-200",
  "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "bg-sky-100 text-sky-700 ring-sky-200",
  "bg-violet-100 text-violet-700 ring-violet-200",
];

export function chipAccent(i: number) {
  return CHIP_ACCENTS[((i % CHIP_ACCENTS.length) + CHIP_ACCENTS.length) % CHIP_ACCENTS.length];
}

// Solid pastel dots for bullet lists.
export const DOT_ACCENTS = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-terracotta-500",
];

export function dotAccent(i: number) {
  return DOT_ACCENTS[((i % DOT_ACCENTS.length) + DOT_ACCENTS.length) % DOT_ACCENTS.length];
}

// Soft, blurred pastel shapes that sit behind a section's content. Drop <Decor />
// just inside a `relative overflow-hidden` section, and give the inner content
// container `relative z-10` so it stays above the shapes.
const TONES: Record<string, [string, string]> = {
  warm: ["bg-rose-200/40", "bg-amber-200/40"],
  cool: ["bg-sky-200/45", "bg-emerald-200/40"],
  mixed: ["bg-violet-200/35", "bg-amber-200/40"],
  blue: ["bg-brand-200/45", "bg-sky-200/40"],
};

export function Decor({
  tone = "cool",
  className = "",
}: {
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const [a, b] = TONES[tone] ?? TONES.cool;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <span
        className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${a}`}
      />
      <span
        className={`absolute -left-20 -bottom-24 h-64 w-64 rounded-full blur-3xl ${b}`}
      />
    </div>
  );
}

// A small crisp ring shape, for a touch of definition (like the landing-page
// stars, but quieter). Position with absolute utilities via className.
export function Ring({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full border-2 ${className}`}
      style={style}
    />
  );
}
