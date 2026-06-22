"use client";

// Embeds the TRG Digital live room-availability badge. The script renders itself
// where it is placed (it inserts the badge before its own <script>), so we inject
// it into this container on mount rather than a bare <script> tag. Matches:
//   <script src="https://www.trgdigital.co.uk/availability.js"
//           data-site="ferndale-nursing-home" defer></script>

import { useEffect, useRef } from "react";

export function AvailabilityBadge() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    const s = document.createElement("script");
    s.src = "https://www.trgdigital.co.uk/availability.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-site", "ferndale-nursing-home");
    el.appendChild(s);
  }, []);

  return <div ref={ref} data-trg-availability className="flex" />;
}
