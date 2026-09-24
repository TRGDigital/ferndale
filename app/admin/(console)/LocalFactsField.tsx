"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveLocalFactsValue, suggestLocalFactsAction } from "./actions";
import type { FactCandidate } from "@/lib/ai/local-facts";

// The local facts box, with a button that asks the AI for candidates.
//
// Everywhere else in this console the AI is held to facts we gave it. This one asks
// it about a town, which is precisely where a model will produce a road that does not
// exist or a hospital that closed in 2012. So nothing it returns is saved: the
// suggestions appear as a checklist, each with a one-click search to confirm it, and
// only what you tick is added to the box. Anything the model is unsure of is marked.

const CATEGORY_LABEL: Record<string, string> = {
  route: "Route",
  landmark: "Landmark",
  council: "Council",
  health: "Health",
  transport: "Transport",
  parking: "Parking",
  community: "Community",
};

export function LocalFactsField({
  path,
  defaultValue,
}: {
  path: string;
  defaultValue: string;
}) {
  const [text, setText] = useState(defaultValue ?? "");
  const [facts, setFacts] = useState<FactCandidate[] | null>(null);
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // Saved as you go. The panel sits in its own form, so pressing Generate does not
  // submit it, and a Save button you have to remember is a Save button that gets
  // missed. Generation reads the saved column, so it must always be current.
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const savedValue = useRef(defaultValue ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persist(value: string) {
    if (value === savedValue.current) return;
    setSaveState("saving");
    saveLocalFactsValue(path, value)
      .then(() => {
        savedValue.current = value;
        setSaveState("saved");
      })
      .catch(() => setSaveState("failed"));
  }

  function scheduleSave(value: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(value), 900);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function suggest() {
    setError("");
    startTransition(async () => {
      const res = await suggestLocalFactsAction(path);
      if (res.error) setError(res.error);
      setFacts(res.facts);
      setChosen(new Set());
    });
  }

  function addChosen() {
    if (!facts) return;
    const picked = [...chosen].sort((a, b) => a - b).map((i) => facts[i]!.fact);
    if (!picked.length) return;
    const existing = text.trim();
    const next = (existing ? `${existing}\n` : "") + picked.map((f) => `- ${f}`).join("\n");
    setText(next);
    persist(next);
    setFacts(facts.filter((_, i) => !chosen.has(i)));
    setChosen(new Set());
  }

  const toggle = (i: number) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={`localFacts-${path}`}
          className="text-sm font-medium text-neutral-700"
        >
          Local facts (what makes this town different)
        </label>
        <span className="ml-auto mr-2 text-xs text-neutral-500">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "failed"
                ? "Not saved, press Save local facts"
                : ""}
        </span>
        <button
          type="button"
          onClick={suggest}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <span
              aria-hidden
              className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : null}
          {pending ? "Looking…" : facts ? "Suggest more" : "Suggest facts with AI"}
        </button>
      </div>

      <textarea
        id={`localFacts-${path}`}
        name="localFacts"
        rows={5}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          scheduleSave(e.target.value);
        }}
        onBlur={(e) => persist(e.target.value)}
        placeholder={"- Nine minutes from here along Ifield Avenue, avoiding the A23\n- West Sussex County Council does the financial assessment\n- Most discharges come from the Princess Royal"}
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <p className="mt-1 text-xs text-neutral-500">
        Drive time and route from this town, the landmark people navigate by, which
        council assesses, the nearest hospital, parking. Fed to the AI when you
        generate, and the single best way to stop this page reading like the others.
        Never shown on the site as-is.
      </p>

      {error ? (
        <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {facts ? (
        facts.length ? (
          <div className="mt-3 rounded-lg border border-emerald-300 bg-white p-3">
            <p className="text-xs font-semibold text-neutral-700">
              Suggestions. Tick the ones you know are true.
            </p>
            <p className="mb-2 mt-1 text-xs text-amber-700">
              These are the AI&apos;s guesses about {path.split("/")[1]?.replace(/-/g, " ")},
              not things it was told. Check anything you are not sure of before ticking
              it: a wrong road or a closed hospital on a care page does real damage.
            </p>
            <ul className="space-y-1.5">
              {facts.map((f, i) => (
                <li key={f.fact} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`fact-${path}-${i}`}
                    checked={chosen.has(i)}
                    onChange={() => toggle(i)}
                    className="mt-1 h-3.5 w-3.5 flex-shrink-0"
                  />
                  <label htmlFor={`fact-${path}-${i}`} className="flex-1 text-sm leading-snug">
                    <span className="mr-1.5 rounded bg-neutral-100 px-1 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                      {CATEGORY_LABEL[f.category] ?? f.category}
                    </span>
                    {f.confidence === "low" ? (
                      <span className="mr-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] uppercase tracking-wide text-amber-800">
                        Check
                      </span>
                    ) : null}
                    {f.fact}{" "}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(f.check)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-xs text-brand-700 underline"
                    >
                      verify
                    </a>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={addChosen}
                disabled={!chosen.size}
                className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-40"
              >
                Add {chosen.size || ""} to local facts
              </button>
              <button
                type="button"
                onClick={() => setFacts(null)}
                className="text-xs text-neutral-500 underline"
              >
                Discard these
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-neutral-500">
            Nothing came back. Try again, or write the facts yourself.
          </p>
        )
      ) : null}
    </div>
  );
}
