"use client";

// Generic embed for any TRG Digital tool. Injects the tools.js script (with the
// given data-tool) into a container so it renders reliably in Next.js. tools.js
// inserts an auto-resizing iframe at the script's position.
//   <script src="https://www.trgdigital.co.uk/tools.js" data-site="…" data-tool="…" defer>

import { useEffect, useRef } from "react";

export function ToolEmbed({
  tool,
  site = "ferndale-nursing-home",
}: {
  tool: string;
  site?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = "1";
    const s = document.createElement("script");
    s.src = "https://www.trgdigital.co.uk/tools.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-site", site);
    s.setAttribute("data-tool", tool);
    el.appendChild(s);
  }, [tool, site]);

  return (
    <div
      ref={ref}
      data-trg-tool={tool}
      aria-label="Care planning tool"
      className="min-h-[420px] w-full"
    />
  );
}
