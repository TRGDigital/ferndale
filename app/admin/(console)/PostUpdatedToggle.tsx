"use client";

import { useState, useTransition } from "react";
import { setPostUpdated } from "./actions";

// "Post updated" tracker on each row of the posts list, the same idea as the one on
// the area pages: a refresh pass across twenty posts takes days, and without a mark
// you lose track of which ones you have already been through. Admin only, never shown
// on the site, and it changes nothing about the post itself.
export function PostUpdatedToggle({ id, initial }: { id: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? "Marked as updated (click to clear)" : "Mark this post as updated"}
      onClick={() => {
        const next = !on;
        setOn(next);
        startTransition(() => setPostUpdated(id, next));
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
      Updated
    </button>
  );
}
