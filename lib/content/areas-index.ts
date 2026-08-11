// The canonical "areas we serve" index: every {town}/{care} landing page that
// actually exists and is indexable — the code-default combos plus any published
// admin-created pages. Shared by the /areas-we-serve/ hub page and the homepage
// section so they never drift, and so both give the location cluster real
// internal links from high-authority pages.

import {
  towns,
  careTypes,
  townBySlug,
  careBySlug,
  titleCaseSlug,
} from "@/lib/content/local-areas";
import { getManagedAreaPages } from "@/lib/data/area-pages";

export type AreaLinkItem = { careSlug: string; careName: string; href: string };
export type TownAreas = { townSlug: string; townName: string; links: AreaLinkItem[] };

/** All towns, each with its available care-type landing pages, in a stable order. */
export async function getAreasWeServe(): Promise<TownAreas[]> {
  const managed = await getManagedAreaPages().catch(() => []);

  const byTown = new Map<string, { townName: string; cares: Map<string, string> }>();

  // Seed every code town with its default care types.
  for (const t of towns) {
    const cares = new Map<string, string>();
    for (const c of careTypes) cares.set(c.slug, c.name);
    byTown.set(t.slug, { townName: t.name, cares });
  }

  // Layer in published admin-created pages (may add care types or whole new towns).
  for (const m of managed) {
    if (!m.townSlug || !m.careSlug) continue;
    const townName =
      m.townName || townBySlug(m.townSlug)?.name || titleCaseSlug(m.townSlug);
    const careName =
      m.careName || careBySlug(m.careSlug)?.name || titleCaseSlug(m.careSlug);
    if (!byTown.has(m.townSlug)) byTown.set(m.townSlug, { townName, cares: new Map() });
    byTown.get(m.townSlug)!.cares.set(m.careSlug, careName);
  }

  // Keep code-town order first, then any extra admin-added towns after.
  const ordered = [
    ...towns.map((t) => t.slug),
    ...[...byTown.keys()].filter((s) => !towns.some((t) => t.slug === s)),
  ];

  return ordered.map((slug) => {
    const entry = byTown.get(slug)!;
    const links = [...entry.cares.entries()]
      .map(([careSlug, careName]) => ({
        careSlug,
        careName,
        href: `/${slug}/${careSlug}/`,
      }))
      .sort((a, b) => a.careName.localeCompare(b.careName));
    return { townSlug: slug, townName: entry.townName, links };
  });
}

/** The primary landing page for a town: the main care type if present, else the first. */
const PRIMARY_CARE_PRIORITY = ["residential-care", "nursing-care"];
export function primaryTownHref(town: TownAreas): string {
  for (const slug of PRIMARY_CARE_PRIORITY) {
    const hit = town.links.find((l) => l.careSlug === slug);
    if (hit) return hit.href;
  }
  return town.links[0]?.href ?? "/contact-us/";
}
