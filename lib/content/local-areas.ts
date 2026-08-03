// Local-area landing pages: a page per town × care type at /{town}/{care}/.
// The heading + intro + body are editable per page in the admin (AreaPage rows);
// these generate the code default when no override exists.

export type Town = { slug: string; name: string };
export type CareType = {
  slug: string;
  name: string; // "Nursing Care"
  noun: string; // "nursing care"
  blurb: string;
  points: string[];
};

// Ferndale's base town (used in the copy).
export const baseTown = "Crawley";

// Towns and villages around Crawley (ordered roughly by distance).
export const towns: Town[] = [
  { slug: "furnace-green", name: "Furnace Green" },
  { slug: "langley-green", name: "Langley Green" },
  { slug: "maidenbower", name: "Maidenbower" },
  { slug: "gossops-green", name: "Gossops Green" },
  { slug: "broadfield", name: "Broadfield" },
  { slug: "bewbush", name: "Bewbush" },
  { slug: "copthorne", name: "Copthorne" },
  { slug: "crawley-down", name: "Crawley Down" },
  { slug: "salfords", name: "Salfords" },
  { slug: "south-nutfield", name: "South Nutfield" },
  { slug: "horsham", name: "Horsham" },
  { slug: "cuckfield", name: "Cuckfield" },
  { slug: "east-grinstead", name: "East Grinstead" },
  { slug: "lingfield", name: "Lingfield" },
  { slug: "reigate", name: "Reigate" },
  { slug: "haywards-heath", name: "Haywards Heath" },
  { slug: "redhill", name: "Redhill" },
  { slug: "forest-row", name: "Forest Row" },
  { slug: "bletchingley", name: "Bletchingley" },
  { slug: "southwater", name: "Southwater" },
  { slug: "dorking", name: "Dorking" },
];

export const careTypes: CareType[] = [
  {
    slug: "nursing-care",
    name: "Nursing Care",
    noun: "nursing care",
    blurb:
      "24-hour nursing care led by qualified registered nurses, for older people with ongoing medical and nursing needs.",
    points: [
      "Care from registered nurses, day and night",
      "Support for complex, long-term and palliative needs",
      "Help with medication, mobility and personal care",
      "Close liaison with GPs and specialist services",
    ],
  },
  {
    slug: "dementia-care",
    name: "Dementia Care",
    noun: "dementia care",
    blurb:
      "Specialist, compassionate dementia and Alzheimer's care in a safe, calm and familiar setting.",
    points: [
      "A safe, secure and easy-to-navigate environment",
      "Person-centred care built around each resident",
      "Staff experienced in dementia and Alzheimer's care",
      "Routine, reassurance and meaningful daily activities",
    ],
  },
];

export function townBySlug(slug: string) {
  return towns.find((t) => t.slug === slug);
}
export function careBySlug(slug: string) {
  return careTypes.find((c) => c.slug === slug);
}

/** "haywards-heath" -> "Haywards Heath". Fallback name for admin-created towns. */
export function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** "What we offer" bullets for an admin-created service type with none set. */
export const GENERIC_CARE_POINTS = [
  "Individually decorated, home-from-home rooms",
  "Freshly cooked, nutritionally balanced meals",
  "A full programme of daily activities",
  "A long-standing, qualified nursing and care team",
];

/** All {town}/{care} combinations, for generateStaticParams + sitemap. */
export function areaCombos() {
  return towns.flatMap((t) =>
    careTypes.map((c) => ({ town: t.slug, care: c.slug })),
  );
}

export const AREA_PATHS = areaCombos().map(
  ({ town, care }) => `/${town}/${care}/`,
);

/** Code-default heading + intro + body (used until the admin overrides them). */
export function defaultAreaContent(town: Town, care: CareType) {
  const heading = `${care.name} in ${town.name}`;
  const intro = `<p>Looking for ${care.noun} in ${town.name}? Ferndale Nursing Home offers ${care.blurb} We are a short distance away in ${baseTown}, West Sussex, and we warmly welcome residents and families from ${town.name} and across the wider area.</p>`;
  const body = `<p>Choosing ${care.noun} for a loved one in ${town.name} is a big decision, and we are here to make it easier. At Ferndale, every resident is known by name and cared for with the time, skill and attention of our registered nursing team.</p>
<p>Families from ${town.name} choose Ferndale for our 24-hour nursing care, our experienced and long-standing team, and our welcoming home in ${baseTown}. Whether you are planning ahead or need ${care.noun} at short notice, we will talk you through everything with no pressure.</p>
<p>You are always welcome to visit, meet the team and see our home for yourself. We would be delighted to show you and your family around.</p>`;
  return { heading, intro, body };
}

/** Roughly geographic near-neighbours (for local flavour in the default copy). */
export const NEIGHBOURS: Record<string, string[]> = {
  "furnace-green": ["Maidenbower", "Broadfield", "Gossops Green"],
  "langley-green": ["Gossops Green", "Bewbush", "Copthorne"],
  maidenbower: ["Furnace Green", "Crawley Down", "Copthorne"],
  "gossops-green": ["Bewbush", "Broadfield", "Langley Green"],
  broadfield: ["Bewbush", "Gossops Green", "Furnace Green"],
  bewbush: ["Broadfield", "Gossops Green", "Horsham"],
  copthorne: ["Crawley Down", "Maidenbower", "East Grinstead"],
  "crawley-down": ["Copthorne", "East Grinstead", "Maidenbower"],
  salfords: ["Redhill", "Reigate", "South Nutfield"],
  "south-nutfield": ["Redhill", "Bletchingley", "Salfords"],
  horsham: ["Southwater", "Bewbush", "Broadfield"],
  cuckfield: ["Haywards Heath", "Balcombe", "Ansty"],
  "east-grinstead": ["Crawley Down", "Forest Row", "Lingfield"],
  lingfield: ["East Grinstead", "Copthorne", "Bletchingley"],
  reigate: ["Redhill", "Dorking", "Salfords"],
  "haywards-heath": ["Cuckfield", "Lindfield", "Burgess Hill"],
  redhill: ["Reigate", "Salfords", "Bletchingley"],
  "forest-row": ["East Grinstead", "Lingfield", "Crawley Down"],
  bletchingley: ["Redhill", "South Nutfield", "Lingfield"],
  southwater: ["Horsham", "Bewbush", "Broadfield"],
  dorking: ["Reigate", "Redhill", "Horsham"],
};

/** Default "Areas we cover" paragraph — rich, full-width copy, until the admin overrides it. */
export function defaultAreasBody(
  townName: string,
  townSlug: string,
  careNoun: string,
) {
  const near = NEIGHBOURS[townSlug] ?? ["Horsham", "East Grinstead", "Haywards Heath"];
  const places = near.join(", ");
  return `<p>Ferndale sits in ${baseTown}, close to Gatwick and within easy reach of families right across West Sussex and east Surrey. We warmly welcome residents and their families from ${townName} and nearby communities including ${places}, so loved ones stay close to home and the people who matter most to them. Whether you are arranging ${careNoun} for the first time or looking for a warmer, more homely setting, you are always welcome to visit, meet the team and see the home for yourself.</p>`;
}
