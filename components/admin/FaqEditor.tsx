"use client";

import { useState } from "react";

type Faq = { question: string; answer: string };

// Parse the stored value (a JSON string of [{question, answer}]) into rows, tolerating bad input.
function parse(v: string | null | undefined): Faq[] {
  if (!v) return [];
  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr)) {
      return arr
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          question: String((x as Faq).question ?? ""),
          answer: String((x as Faq).answer ?? ""),
        }));
    }
  } catch {
    /* not valid JSON — start empty */
  }
  return [];
}

// Accordion editor for FAQs: add / remove / edit each question and answer separately. Serialises to
// a hidden input so it submits with the existing server action (which stores the same JSON).
export function FaqEditor({
  name = "faqs",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  const [items, setItems] = useState<Faq[]>(() => parse(defaultValue));
  const [open, setOpen] = useState<Set<number>>(() => new Set());

  const update = (i: number, patch: Partial<Faq>) =>
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const remove = (i: number) => {
    setItems((prev) => prev.filter((_, j) => j !== i));
    setOpen(new Set()); // indices shift after a removal — collapse all to stay in sync
  };

  const add = () =>
    setItems((prev) => {
      const next = [...prev, { question: "", answer: "" }];
      setOpen((o) => new Set(o).add(next.length - 1));
      return next;
    });

  const toggle = (i: number) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const cleaned = items
    .map((it) => ({ question: it.question.trim(), answer: it.answer.trim() }))
    .filter((it) => it.question || it.answer);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-neutral-600">FAQs</span>
      {items.length === 0 ? (
        <p className="text-xs text-neutral-400">
          No FAQs yet. Add your first question below.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="overflow-hidden rounded border border-neutral-300">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(i);
                }
              }}
              className="flex cursor-pointer items-center justify-between gap-2 bg-neutral-50 px-3 py-2 hover:bg-neutral-100"
            >
              <span className="truncate font-medium text-neutral-700">
                {it.question || (
                  <span className="font-normal text-neutral-400">New question…</span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
                <span className="text-xs text-neutral-400">
                  {open.has(i) ? "▲" : "▼"}
                </span>
              </span>
            </div>
            {open.has(i) ? (
              <div className="flex flex-col gap-2 border-t border-neutral-200 p-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-neutral-500">Question</span>
                  <input
                    value={it.question}
                    onChange={(e) => update(i, { question: e.target.value })}
                    className="rounded border border-neutral-300 px-2 py-1.5"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-neutral-500">Answer</span>
                  <textarea
                    value={it.answer}
                    onChange={(e) => update(i, { answer: e.target.value })}
                    rows={3}
                    className="rounded border border-neutral-300 px-2 py-1.5"
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={add}
          className="rounded border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
        >
          + Add FAQ
        </button>
      </div>

      {/* Submits with the form; empty clears the column. */}
      <input
        type="hidden"
        name={name}
        value={cleaned.length ? JSON.stringify(cleaned) : ""}
      />
    </div>
  );
}
