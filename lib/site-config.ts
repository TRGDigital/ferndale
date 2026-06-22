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
  cqcLocationId: process.env.CQC_LOCATION_ID ?? "1-108317835", // Ferndale Nursing Home, Crawley
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
  accreditations: ["RNHA", "Food Hygiene Rating", "carehome.co.uk Recommended"],
} as const;

export type SiteConfig = typeof siteConfig;
