// CQC Syndication API — fetches the location's overall rating once a day.
//
// Hard rule #4: this rating is DISPLAY-ONLY. It must never appear in
// aggregateRating/Review JSON-LD — it's a regulatory rating, not user reviews.
//
// Resilience: uses Next's fetch data cache (stale-while-revalidate, tag "cqc"),
// so a failed daily refresh keeps serving the last good value. If the API is
// unconfigured or unreachable on a cold cache, returns null and the badge shows
// a neutral fallback — it never blanks the footer.

export type CqcRating = {
  rating: string;
  reportDate: string | null;
  locationId: string;
};

export async function getCqcRating(): Promise<CqcRating | null> {
  const id = process.env.CQC_LOCATION_ID;
  const key = process.env.CQC_API_KEY;
  if (!id || !key) return null;

  const partnerCode = process.env.CQC_PARTNER_CODE ?? "";
  const url = `https://api.service.cqc.org.uk/public/v1/locations/${encodeURIComponent(
    id,
  )}?partnerCode=${encodeURIComponent(partnerCode)}`;

  try {
    const res = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": key },
      next: { revalidate: 86_400, tags: ["cqc"] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      currentRatings?: { overall?: { rating?: string; reportDate?: string } };
    };
    const overall = data.currentRatings?.overall;
    if (!overall?.rating) return null;
    return {
      rating: overall.rating,
      reportDate: overall.reportDate ?? null,
      locationId: id,
    };
  } catch {
    return null;
  }
}

// Live rating via CQC's public widget endpoint — needs NO API key. Returns the
// overall rating, its slug and the report date by parsing the widget's JSONP
// response. Cached daily (tag "cqc"), resilient: returns null on any failure.
export type CqcWidgetRating = {
  name: string | null;
  rating: string | null; // e.g. "Good"
  ratingSlug: string | null; // e.g. "good"
  reportDate: string | null; // e.g. "16 August 2019"
};

export async function getCqcWidgetRating(
  locationId: string,
): Promise<CqcWidgetRating | null> {
  if (!locationId) return null;
  const container = `CQCWidget-${locationId}-1`;
  const url = `https://www.cqc.org.uk/widget/${encodeURIComponent(
    locationId,
  )}/${container}/location?callback=CQCWidgetDisplayWidget`;

  try {
    const res = await fetch(url, { next: { revalidate: 86_400, tags: ["cqc"] } });
    if (!res.ok) return null;
    const text = await res.text();
    const wrapped = text.match(/^CQCWidgetDisplayWidget\(([\s\S]*)\)\s*;?\s*$/);
    if (!wrapped) return null;
    const obj = JSON.parse(wrapped[1]) as { response?: string };
    const html = obj.response ?? "";
    if (/service_not_found|don't currently have/i.test(html)) return null;

    const pick = (re: RegExp) => {
      const m = html.match(re);
      return m ? m[1].replace(/\s+/g, " ").trim() : null;
    };
    const name = pick(/cqc-service-name"[^>]*>([^<]+)</i);
    const rating = pick(/cqc-widget-overall[^"]*"[^>]*>([^<]+)</i);
    const slugMatch = html.match(/cqc-widget-overall\s+([a-z-]+)"/i);
    const reportDate = pick(/cqc-widget-date"[^>]*>([^<]+)</i);

    if (!rating) return null;
    return {
      name,
      rating,
      ratingSlug: slugMatch ? slugMatch[1].toLowerCase() : null,
      reportDate,
    };
  } catch {
    return null;
  }
}
