"use client";

import { useState } from "react";

// A text field that counts as you type, for the two fields where length decides
// whether Google shows what you wrote or truncates it mid-sentence.
//
// The limits are not hard rules (Google measures pixels, not characters), so the
// count guides rather than blocks: amber as you approach, red past the point where
// the end is likely to be cut off. Nothing stops you saving a longer one.

export function CountedField({
  label,
  name,
  defaultValue,
  limit,
  hint,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  /** Where truncation usually starts: about 60 for a title, about 155 for a description. */
  limit: number;
  hint?: string;
  /** Set for a textarea instead of a single line. */
  rows?: number;
  /** What the site will use if this is left empty. */
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const count = value.length;
  const tone =
    count === 0
      ? "text-neutral-400"
      : count > limit
        ? "text-red-600"
        : count > limit - 10
          ? "text-amber-600"
          : "text-neutral-500";

  const shared = {
    name,
    value,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(e.target.value),
    className:
      "w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
  };

  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className={`text-xs tabular-nums ${tone}`}>
          {count} / {limit}
          {count > limit ? " · likely to be cut off" : ""}
        </span>
      </span>
      {rows ? <textarea rows={rows} {...shared} /> : <input type="text" {...shared} />}
      {hint ? <span className="mt-1 block text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}
