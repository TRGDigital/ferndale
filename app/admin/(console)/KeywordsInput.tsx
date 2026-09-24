"use client";

import { useRef, useState } from "react";

// Target keywords for a local area page. A keyword is usually a phrase ("residential
// care home haywards heath"), so typing them into one plain text box makes it
// impossible to tell where one ends and the next begins. Here a comma (or Enter, or
// Tab) packages up whatever you have typed into a chip, and the chips are submitted
// as one comma separated string in a hidden field, which is what the server action
// and the AI prompt already expect.

function parse(value: string): string[] {
  return value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function KeywordsInput({
  name,
  defaultValue,
  label = "Target keywords",
  hint,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
}) {
  const [keywords, setKeywords] = useState<string[]>(parse(defaultValue ?? ""));
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const next = parse(raw);
    if (!next.length) return;
    setKeywords((prev) => {
      const seen = new Set(prev.map((k) => k.toLowerCase()));
      return [...prev, ...next.filter((k) => !seen.has(k.toLowerCase()) && seen.add(k.toLowerCase()))];
    });
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter" || e.key === "Tab") {
      if (!draft.trim()) return;
      // Enter inside a form would submit it, and Tab would leave the field with the
      // draft unsaved, so both are taken over while there is something to commit.
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && keywords.length) {
      setKeywords((prev) => prev.slice(0, -1));
    }
  }

  function remove(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
    inputRef.current?.focus();
  }

  // The draft is included so a keyword typed but not yet comma'd is never lost when
  // the form is submitted straight from the text box.
  const value = [...keywords, ...parse(draft)].join(", ");

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      <input type="hidden" name={name} value={value} />

      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
      >
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-sm text-brand-800 ring-1 ring-brand-200"
          >
            {kw}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(kw);
              }}
              aria-label={`Remove ${kw}`}
              className="text-brand-400 hover:text-brand-700"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => {
            // Handles a pasted list as well as ordinary typing.
            if (e.target.value.includes(",")) commit(e.target.value);
            else setDraft(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={keywords.length ? "Add another…" : "Type a keyword, then a comma"}
          className="min-w-[180px] flex-1 border-0 p-0.5 text-sm outline-none placeholder:text-neutral-400"
        />
      </div>

      <span className="mt-1 block text-xs text-neutral-500">
        {hint ??
          "Separate with commas. The first keyword is the main one the page is written around; the rest are worked into the H2s and H3s."}
      </span>
    </label>
  );
}
