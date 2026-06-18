"use client";

// Accessibility controls, kept visible (not hidden in a menu) so they're easy
// to find. Text size, high-contrast, a readable font, and read-aloud. Choices
// persist in localStorage and are applied before paint by a script in the root
// layout (no flash).

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/site/Icon";

const SCALES: Record<string, string> = { base: "100%", lg: "112.5%", xl: "125%" };
const SIZE_OPTS = [
  { key: "base", label: "A", title: "Default text size" },
  { key: "lg", label: "A+", title: "Larger text" },
  { key: "xl", label: "A++", title: "Largest text" },
];

function fire() {
  window.dispatchEvent(new Event("cw-a11y"));
}
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cw-a11y", cb);
  return () => window.removeEventListener("cw-a11y", cb);
}
function snapshot() {
  const d = document.documentElement;
  return `${d.dataset.textsize || "base"}|${d.classList.contains("hc") ? 1 : 0}|${
    d.classList.contains("readable") ? 1 : 0
  }`;
}

function setSize(key: string) {
  const d = document.documentElement;
  d.style.fontSize = SCALES[key] ?? "100%";
  d.dataset.textsize = key;
  try {
    localStorage.setItem("cw_textsize", key);
  } catch {
    /* ignore */
  }
  fire();
}
function toggleClass(cls: string, lsKey: string) {
  const d = document.documentElement;
  const on = !d.classList.contains(cls);
  d.classList.toggle(cls, on);
  try {
    localStorage.setItem(lsKey, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  fire();
}

export function AccessibilityBar() {
  const state = useSyncExternalStore(subscribe, snapshot, () => "base|0|0");
  const [size, hc, readable] = state.split("|");
  const [speaking, setSpeaking] = useState(false);

  function toggleSpeak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.getElementById("main-content");
    const text = (main?.innerText || document.body.innerText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 9000);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  const toggle = (active: boolean) =>
    `rounded px-2.5 py-1 font-medium transition-colors ${
      active ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-100"
    }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs">
      <span className="flex items-center gap-1.5 font-semibold text-brand-700">
        <Icon name="accessibility" className="h-4 w-4" />
        Accessibility
      </span>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <div className="flex items-center gap-1" role="group" aria-label="Text size">
        <span className="text-muted">Text size</span>
        {SIZE_OPTS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setSize(o.key)}
            title={o.title}
            aria-pressed={size === o.key}
            className={`min-w-[1.75rem] rounded px-2 py-0.5 font-semibold ${
              o.key === "base" ? "text-xs" : o.key === "lg" ? "text-sm" : "text-base"
            } ${
              size === o.key
                ? "bg-brand-600 text-white"
                : "text-brand-700 hover:bg-brand-100"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => toggleClass("hc", "cw_contrast")}
        aria-pressed={hc === "1"}
        className={toggle(hc === "1")}
      >
        High contrast
      </button>

      <button
        type="button"
        onClick={() => toggleClass("readable", "cw_font")}
        aria-pressed={readable === "1"}
        className={toggle(readable === "1")}
      >
        Readable font
      </button>

      <button
        type="button"
        onClick={toggleSpeak}
        aria-pressed={speaking}
        className={toggle(speaking)}
      >
        {speaking ? "Stop reading" : "Listen to page"}
      </button>
      </div>
    </div>
  );
}
