"use client";

// Minimal, accessible cookie-consent banner. Sets `cw_consent=accepted|rejected`.
// The exit/scroll popup only arms once consent === "accepted".

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/site/Icon";

export const CONSENT_COOKIE = "cw_consent";
// Fired by the footer "Cookie settings" link to re-open the banner.
export const CONSENT_OPEN_EVENT = "cw-consent-open";

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  }
}

export function getConsent(): "accepted" | "rejected" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)cw_consent=([^;]+)/);
  return m ? (m[1] as "accepted" | "rejected") : null;
}

function setConsent(value: "accepted" | "rejected") {
  const maxAge = 60 * 60 * 24 * 180; // 180 days
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  // Let the popup (and anything else) react without a reload.
  window.dispatchEvent(new CustomEvent("cw-consent", { detail: value }));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cw-consent", cb);
  return () => window.removeEventListener("cw-consent", cb);
}

export function CookieConsent() {
  // Only render after mount. The page is statically generated, so rendering the
  // banner during SSR would bake it into the HTML and flash on every load before
  // hydration reads the cookie. Gating on `mounted` keeps the server/first-paint
  // output empty (no flash); the banner appears only if there's no saved choice.
  const [mounted, setMounted] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
    const open = () => setForceOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);
  // Hide once a choice exists, unless the visitor re-opened it from the footer.
  if (!mounted || (consent !== null && !forceOpen)) return null;

  function choose(value: "accepted" | "rejected") {
    setConsent(value);
    setForceOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-brand-100 bg-white p-4 shadow-xl"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Icon name="cookie" className="h-4 w-4 text-brand-600" />
        <p className="text-sm font-semibold text-brand-700">
          We value your privacy
        </p>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        We use cookies to understand how visitors use our website and to improve
        it. You can accept or decline non-essential cookies; essential cookies
        are always on. Read our{" "}
        <Link href="/cookie-policy/" className="font-medium text-brand-700 underline">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => choose("rejected")}
          className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:border-brand-400"
        >
          Decline
        </button>
        <button
          onClick={() => choose("accepted")}
          className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
