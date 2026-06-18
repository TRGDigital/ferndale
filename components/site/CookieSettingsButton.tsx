"use client";

import { openCookieSettings } from "@/components/site/CookieConsent";

// Footer link that re-opens the cookie consent banner so visitors can change
// their choice at any time.
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
