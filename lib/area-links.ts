// The "Areas we cover" link grid on a local area page.
//
// The original rule was "every other town that has this same service", which works
// for the built-in combos but leaves a page with nothing at all when its service
// exists in only one town (a managed page such as /haywards-heath/dementia-care/ or
// /whitemans-green/care-home/). Those pages rendered the heading with an empty grid,
// or no section at all.
//
// So the list is built in order of usefulness and only falls through when it has to:
//   1. the same service in other towns, which is the closest match for the reader
//   2. the other services we offer in this same town
//   3. anything else live, nearest thing to a related page
//
// Shared by the public page and the admin editor, so the box in the console shows
// exactly what the page will render.

export type AreaPair = {
  townSlug: string;
  townName: string;
  careSlug: string;
  careName: string;
};

export type AreaLink = { label: string; href: string };

/** How many links the grid shows before it stops being a help and starts being a list. */
export const AREA_LINK_LIMIT = 12;

export function buildAreaLinks(
  pairs: AreaPair[],
  townSlug: string,
  careSlug: string,
  limit = AREA_LINK_LIMIT,
): AreaLink[] {
  const isSelf = (p: AreaPair) => p.townSlug === townSlug && p.careSlug === careSlug;

  const sameService = pairs.filter((p) => !isSelf(p) && p.careSlug === careSlug);
  const sameTown = pairs.filter((p) => !isSelf(p) && p.townSlug === townSlug);
  const rest = pairs.filter(
    (p) => !isSelf(p) && p.careSlug !== careSlug && p.townSlug !== townSlug,
  );

  const out: AreaLink[] = [];
  const seen = new Set<string>();
  for (const p of [...sameService, ...sameTown, ...rest]) {
    const href = `/${p.townSlug}/${p.careSlug}/`;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ label: `${p.careName} in ${p.townName}`, href });
    if (out.length >= limit) break;
  }
  return out;
}

/** The same links as the admin textarea format: one "Label | /path/" per line. */
export function areaLinksToText(links: AreaLink[]): string {
  return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}
