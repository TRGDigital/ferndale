"use client";

import { useState, useTransition } from "react";
import { setAreaPageUpdated } from "./actions";

// Admin-only "Page updated" tracker shown on each area page row. A radio-style
// toggle, off by default, so Len can see at a glance which pages he has refreshed.
// It sits inside the accordion <summary>, so it stops propagation to avoid
// expanding/collapsing the row when clicked. It never changes page content.
export function AreaUpdatedToggle({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? "Marked as updated (click to clear)" : "Mark this page as updated"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !on;
        setOn(next);
        startTransition(() => setAreaPageUpdated(path, next));
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors ${
        on
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-neutral-200 bg-white text-neutral-400 hover:text-neutral-600"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full border ${
          on ? "border-green-500 bg-green-500" : "border-neutral-300"
        }`}
        aria-hidden
      />
      Page updated
    </button>
  );
}
