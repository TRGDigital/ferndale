"use client";

// Consent-gated Google Analytics. GA only loads once the visitor has accepted
// cookies (cw_consent=accepted). It reacts live to the consent banner: accepting
// loads GA immediately; declining (or no choice yet) means GA never loads.

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { getConsent } from "@/components/site/CookieConsent";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cw-consent", cb);
  return () => window.removeEventListener("cw-consent", cb);
}

export function Analytics({ gaId }: { gaId: string }) {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);
  if (consent !== "accepted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
