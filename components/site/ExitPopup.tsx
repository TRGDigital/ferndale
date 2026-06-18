"use client";

// Config-driven lead popup. Triggers: exit-intent (desktop), scroll depth,
// time-on-page, end-of-blog-post (a [data-end-of-post] sentinel). Frequency-
// capped by cookie, gated on cookie consent, accessible (focus trap, ESC,
// ARIA). On mobile it's a bottom sheet and never fires on page-load
// (no intrusive interstitial — hard rule #8).

import { useCallback, useEffect, useRef, useState } from "react";
import { getConsent } from "@/components/site/CookieConsent";

const FREQ_COOKIE = "cw_popup";

type Config = {
  scrollDepth: number; // 0..1
  timeOnPageMs: number;
  frequencyDays: number;
  exitIntent: boolean;
  endOfPost: boolean;
};

const DEFAULT: Config = {
  scrollDepth: 0.6,
  timeOnPageMs: 45_000,
  frequencyDays: 7,
  exitIntent: true,
  endOfPost: true,
};

function recentlyShown(): boolean {
  return /(?:^|;\s*)cw_popup=1/.test(document.cookie);
}
function markShown(days: number) {
  document.cookie = `${FREQ_COOKIE}=1; path=/; max-age=${days * 86400}; samesite=lax`;
}

export function ExitPopup(props: Partial<Config>) {
  const cfg = { ...DEFAULT, ...props };
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<"BOOK_VISIT" | "BROCHURE" | null>(null);
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const firedRef = useRef(false);

  const fire = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    lastFocused.current = document.activeElement as HTMLElement;
    markShown(cfg.frequencyDays);
    setOpen(true);
  }, [cfg.frequencyDays]);

  // Arm triggers once consent is accepted and not recently shown.
  useEffect(() => {
    let cleanup = () => {};

    function arm() {
      if (firedRef.current || recentlyShown()) return;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const cleanups: (() => void)[] = [];

      // Scroll depth (all viewports).
      const onScroll = () => {
        const scrolled =
          (window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight;
        if (scrolled >= cfg.scrollDepth) fire();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));

      // End-of-post sentinel (all viewports).
      if (cfg.endOfPost) {
        const sentinel = document.querySelector("[data-end-of-post]");
        if (sentinel) {
          const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) fire();
          });
          io.observe(sentinel);
          cleanups.push(() => io.disconnect());
        }
      }

      // Desktop-only: exit-intent + time-on-page (never on mobile page-load).
      if (!isMobile) {
        if (cfg.exitIntent) {
          const onLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) fire();
          };
          document.addEventListener("mouseout", onLeave);
          cleanups.push(() => document.removeEventListener("mouseout", onLeave));
        }
        const t = window.setTimeout(fire, cfg.timeOnPageMs);
        cleanups.push(() => window.clearTimeout(t));
      }

      cleanup = () => cleanups.forEach((c) => c());
    }

    if (getConsent() === "accepted") {
      arm();
    } else {
      const onConsent = (e: Event) => {
        if ((e as CustomEvent).detail === "accepted") arm();
      };
      window.addEventListener("cw-consent", onConsent);
      cleanup = () => window.removeEventListener("cw-consent", onConsent);
    }

    return () => cleanup();
  }, [cfg.scrollDepth, cfg.timeOnPageMs, cfg.exitIntent, cfg.endOfPost, fire]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocused.current?.focus?.();
  }, []);

  // Focus management + ESC + focus trap while open.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, intent, done]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      await fetch("/api/public/leads/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          intent,
          source: `popup:${location.pathname}`,
        }),
      });
    } catch {
      /* swallow — show success regardless to avoid a dead-end */
    }
    setDone(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cw-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-cream p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between">
          <h2 id="cw-popup-title" className="font-serif text-2xl text-brand-700">
            {done ? "Thank you" : "Considering Ferndale?"}
          </h2>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-full px-2 text-xl text-muted hover:text-ink"
          >
            ×
          </button>
        </div>

        {done ? (
          <p className="mt-3 text-ink/80">
            Thanks. We’ll be in touch shortly. You can also call us on 01444 416
            841.
          </p>
        ) : !intent ? (
          <>
            <p className="mt-2 text-sm text-ink/80">
              We’d love to help. What would you like to do?
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() => setIntent("BOOK_VISIT")}
                className="rounded-full bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
              >
                Book a visit
              </button>
              <button
                onClick={() => setIntent("BROCHURE")}
                className="rounded-full border border-brand-600 px-5 py-3 font-medium text-brand-700 hover:bg-brand-50"
              >
                Request a brochure / more info
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <input
              name="name"
              required
              placeholder="Your name"
              className="rounded border border-brand-200 px-3 py-2"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="rounded border border-brand-200 px-3 py-2"
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded border border-brand-200 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
            >
              {intent === "BOOK_VISIT" ? "Request my visit" : "Send me info"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
