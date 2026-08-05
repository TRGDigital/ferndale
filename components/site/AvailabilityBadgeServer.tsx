import { siteConfig } from "@/lib/site-config";

// Server-rendered live room-availability badge. The number is fetched from the
// TRG platform at render time (revalidated every 30s) and written straight into
// the HTML, so it is in the initial server response and readable by Googlebot
// and non-JS crawlers, unlike the old client-injected availability.js embed.
//
// Mirrors the visual of https://www.trgdigital.co.uk/availability.js exactly
// (colour-driven pill + pulsing dot). Renders nothing when the platform reports
// no availability (show:false = currently full / enquiries-only).

type Availability = {
  show: boolean;
  status?: "available" | "limited" | "full" | "unknown";
  rooms?: number;
  note?: string;
  label?: string;
  color?: string;
};

async function getAvailability(): Promise<Availability | null> {
  try {
    const res = await fetch(
      `https://www.trgdigital.co.uk/api/availability?site=${siteConfig.platformSlug}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Availability;
  } catch {
    return null;
  }
}

export async function AvailabilityBadgeServer({ className }: { className?: string }) {
  const d = await getAvailability();
  if (!d || !d.show) return null;

  const c = d.color || "#16a34a";
  const live = d.status === "available" || d.status === "limited";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        whiteSpace: "nowrap",
        border: `1px solid ${c}40`,
        background: `${c}14`,
        color: c,
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 1,
        borderRadius: 999,
        padding: "7px 13px",
      }}
    >
      <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, flex: "0 0 auto" }}>
        {live && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: c,
              opacity: 0.65,
              animation: "trgav-ping 1.5s cubic-bezier(0,0,.2,1) infinite",
            }}
          />
        )}
        <span
          style={{
            position: "relative",
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: 999,
            background: c,
          }}
        />
      </span>
      <span>
        {d.label}
        {d.note ? <span style={{ fontWeight: 400, opacity: 0.8 }}> · {d.note}</span> : null}
      </span>
    </span>
  );
}
