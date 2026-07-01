"use client";

// Accessibility controls, kept visible (not hidden in a menu) so they're easy
// to find. Text size, high-contrast, a readable font, and read-aloud. Choices
// persist in localStorage and are applied before paint by a script in the root
// layout (no flash).

import { useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/site/Icon";
import { siteConfig } from "@/lib/site-config";

// Warm neural read-aloud of the site's "Read-aloud welcome", generated + cached
// on the TRG platform. Falls back to the browser voice if it's unavailable.
const TTS_ENDPOINT = "https://www.trgdigital.co.uk/api/accessibility-tts";

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

// Choose the warmest, most human-sounding voice the browser offers, preferring
// UK-English neural/enhanced voices (Edge "Natural", Chrome "Google UK", Apple
// enhanced). Falls back gracefully to any English voice, then the default.
function pickWarmVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const enGB = voices.filter((v) => /en[-_]GB/i.test(v.lang));
  const enAny = voices.filter((v) => /^en/i.test(v.lang));
  const find = (pool: SpeechSynthesisVoice[], re: RegExp) =>
    pool.find((v) => re.test(v.name)) ?? null;
  return (
    // Edge/Windows neural "Natural" voices — warm UK female first.
    find(enGB, /natural/i) ||
    find(enAny, /natural/i) ||
    // Chrome's bundled UK voices.
    find(voices, /google uk english female/i) ||
    find(voices, /google uk english/i) ||
    // Apple enhanced/premium UK female voices.
    find(enGB, /serena|kate|stephanie|martha|fiona|jamie/i) ||
    enGB.find((v) => /female/i.test(v.name)) ||
    enGB[0] ||
    enAny[0] ||
    voices[0] ||
    null
  );
}

export function AccessibilityBar({ listenIntro }: { listenIntro?: string }) {
  const state = useSyncExternalStore(subscribe, snapshot, () => "base|0|0");
  const [size, hc, readable] = state.split("|");
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playIdRef = useRef(0);

  function stopAll() {
    playIdRef.current++; // invalidate any in-flight request
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        audioRef.current.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setLoading(false);
  }

  // Fallback: read the welcome with the warmest available browser voice, sentence
  // by sentence so it paces naturally.
  function browserSpeak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
      setSpeaking(false);
      return;
    }
    const synth = window.speechSynthesis;
    const start = () => {
      const voice = pickWarmVoice(synth.getVoices() || []);
      const chunks =
        text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
      synth.cancel();
      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        }
        u.rate = 0.95;
        u.pitch = 1;
        if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        synth.speak(u);
      });
      setSpeaking(true);
    };
    if ((synth.getVoices() || []).length) start();
    else {
      let done = false;
      const on = () => {
        if (done) return;
        done = true;
        synth.removeEventListener("voiceschanged", on);
        start();
      };
      synth.addEventListener("voiceschanged", on);
      setTimeout(on, 300);
    }
  }

  // "Listen": play a warm neural reading of the site's Read-aloud welcome — only
  // the welcome, nothing else. Falls back to the browser voice if the neural
  // service isn't configured or fails.
  async function toggleSpeak() {
    if (speaking || loading) {
      stopAll();
      return;
    }
    const fallbackText = (listenIntro || siteConfig.listenIntro || "").trim();
    const myId = ++playIdRef.current;
    setLoading(true);
    try {
      const r = await fetch(
        `${TTS_ENDPOINT}?site=${encodeURIComponent(siteConfig.platformSlug)}`,
      );
      const data = (await r.json().catch(() => ({}))) as {
        url?: string | null;
        text?: string;
      };
      if (myId !== playIdRef.current) return; // stopped / superseded while loading
      const text = (data.text || fallbackText).trim();
      setLoading(false);
      if (data.url) {
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audioRef.current = audio;
        }
        audio.src = data.url;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => browserSpeak(text);
        setSpeaking(true);
        audio.play().catch(() => browserSpeak(text));
      } else if (text) {
        browserSpeak(text);
      }
    } catch {
      if (myId !== playIdRef.current) return;
      setLoading(false);
      if (fallbackText) browserSpeak(fallbackText);
    }
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
        aria-busy={loading}
        className={toggle(speaking || loading)}
      >
        {loading ? "Loading…" : speaking ? "Stop" : "Listen to page"}
      </button>
      </div>
    </div>
  );
}
