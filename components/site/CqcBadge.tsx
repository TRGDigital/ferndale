import { siteConfig } from "@/lib/site-config";
import { getCqcWidgetRating } from "@/lib/cqc";
import { ManagedImg } from "@/components/ManagedImg";

// Native CQC ratings badge styled to match the site. We pull the live rating
// from CQC's public widget endpoint (no API key needed) and render it ourselves,
// so there's no boxed iframe. Display-only (hard rule #4): never JSON-LD.

const CQC_LOGO =
  "https://trmwjilicdxgrzbwzchf.supabase.co/storage/v1/object/public/blog/site/badges/cqc-logo.png";

const RATING_COLOUR: Record<string, string> = {
  outstanding: "text-emerald-700",
  good: "text-green-700",
  "requires-improvement": "text-amber-700",
  inadequate: "text-red-700",
};

export async function CqcBadge() {
  const locationId = siteConfig.cqcLocationId; // set once Ferndale's CQC ID is confirmed
  const profileUrl = locationId
    ? `https://www.cqc.org.uk/location/${locationId}`
    : "https://www.cqc.org.uk/search/all?query=Ferndale%20Nursing%20Home%20Crawley";
  const data = locationId ? await getCqcWidgetRating(locationId) : null;

  // Ferndale's published rating is Good; shown as a safe fallback until the live
  // widget data (which needs the confirmed location ID) is available.
  const rating = data?.rating ?? "Good";
  const slug = data?.ratingSlug ?? "good";
  const colour = RATING_COLOUR[slug] ?? "text-ink";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener"
      className="group mt-4 flex w-full max-w-[16rem] items-center gap-3 rounded-xl border border-brand-100 bg-white p-3 transition hover:border-brand-300 hover:shadow-sm"
    >
      <ManagedImg
        src={CQC_LOGO}
        fallbackAlt="Care Quality Commission"
        className="h-9 w-auto shrink-0"
      />
      <span className="leading-tight">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
          CQC overall rating
        </span>
        <span className={`block text-base font-semibold ${colour}`}>
          {rating}
        </span>
        {data?.reportDate ? (
          <span className="block text-xs text-muted">
            as of {data.reportDate}
          </span>
        ) : null}
        <span className="mt-0.5 block text-xs font-medium text-brand-600 group-hover:underline">
          See the report →
        </span>
      </span>
    </a>
  );
}
