// Central site facts — NAP, geo, areas served. Single source of truth for
// schema.ts (LocalBusiness JSON-LD) and the footer. Swap these (+ env) to
// reuse the whole architecture for another care site (see runbook reuse note).

export const siteConfig = {
  name: process.env.SITE_NAME ?? "Ferndale Nursing Home",
  legalName: "Ferndale Healthcare Limited",
  url: process.env.SITE_URL ?? "https://ferndale.vercel.app",
  description:
    "Ferndale Nursing Home in Crawley, West Sussex — warm, person-centred " +
    "24-hour nursing care, including specialist dementia and Parkinson's care, plus respite.",
  telephone: "01293 520368",
  telephoneE164: "+441293520368",
  email: "enquiries@ferndalenursinghome.co.uk",
  // TODO: confirm Ferndale's office hours (using a sensible default for now).
  officeHours: "Monday to Friday, 9am to 5pm",
  manager: "Ramesh Mannick",
  beds: 28,
  cqcLocationId: process.env.CQC_LOCATION_ID || "1-108317835", // Ferndale Nursing Home, Crawley (|| so an empty env var cannot blank the live widget)
  address: {
    streetAddress: "124 Malthouse Road",
    addressLocality: "Crawley",
    addressRegion: "West Sussex",
    postalCode: "RH10 6BH",
    addressCountry: "GB",
  },
  // Approx coordinates for RH10 6BH, Crawley. Refine to the exact building if needed.
  geo: { latitude: 51.1042, longitude: -0.1976 },
  areaServed: ["Crawley", "Horsham", "Mid Sussex", "Gatwick"],
  sisterHome: {
    name: "Crossways Residential Care Home",
    locality: "Lindfield",
    url: "https://www.crosswayscarehome.co.uk/",
  },
  // Guide fees for /fees/ + LocalBusiness price schema. UNSET until Len confirms
  // Ferndale's public guide figures; everything fee-related renders only when set.
  fees: undefined as
    | {
        priceRange: string;
        offers: { name: string; price?: number; minPrice?: number; maxPrice?: number; note?: string }[];
      }
    | undefined,
  accreditations: ["RNHA", "Food Hygiene Rating", "carehome.co.uk Recommended"],
  // This site's slug in the TRG platform (trgdigital.co.uk/admin/websites),
  // used to read platform-managed settings such as the read-aloud welcome.
  platformSlug: "ferndale-nursing-home",
  // Fallback welcome spoken first by the accessibility bar's "Listen to page"
  // button (never shown on screen). Edit freely; keep it warm and brief.
  listenIntro:
    "Welcome to Ferndale Nursing Home. You are listening to our website read aloud. " +
    "Ferndale is a warm, family run nursing home in Crawley, West Sussex, providing 24 hour " +
    "nursing care, including specialist dementia and Parkinson's care, plus respite, for people " +
    "aged 65 and over. You can change the text size, turn on high contrast, or switch to a more " +
    "readable font using the controls at the top of the page. We will now read the rest of this page.",
} as const;

export type SiteConfig = typeof siteConfig;
