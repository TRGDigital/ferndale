// Read layer for local-area landing pages. An AreaPage row can be either:
//   • a content override for a code-defined town x care combo (managed = false), or
//   • a fully admin-created page (managed = true) that defines its own town + service.
// Cached under `area-pages` + `area:<path>`; the admin revalidates on save.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type Faq = { question: string; answer: string };

export type AreaPageRow = {
  path: string;
  managed: boolean;
  published: boolean;
  townSlug: string | null;
  townName: string | null;
  careSlug: string | null;
  careName: string | null;
  careNoun: string | null;
  targetKeyword: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  heading: string | null;
  intro: string | null;
  body: string | null;
  areasHeading: string | null;
  areasBody: string | null;
  areasLinks: AreaLink[] | null;
  offerPoints: string[] | null;
  faqs: Faq[] | null;
};

export type AreaLink = { label: string; href: string };

function toPoints(v: unknown): string[] | null {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : null;
}
function toLinks(v: unknown): AreaLink[] | null {
  return Array.isArray(v)
    ? v.filter(
        (l): l is AreaLink =>
          !!l &&
          typeof (l as AreaLink).label === "string" &&
          typeof (l as AreaLink).href === "string",
      )
    : null;
}
function toFaqs(v: unknown): Faq[] | null {
  return Array.isArray(v)
    ? v.filter(
        (f): f is Faq =>
          !!f &&
          typeof (f as Faq).question === "string" &&
          typeof (f as Faq).answer === "string",
      )
    : null;
}
function shape(row: Record<string, unknown> | null): AreaPageRow | null {
  if (!row) return null;
  return {
    path: row.path as string,
    managed: !!row.managed,
    published: row.published !== false,
    townSlug: (row.townSlug as string) ?? null,
    townName: (row.townName as string) ?? null,
    careSlug: (row.careSlug as string) ?? null,
    careName: (row.careName as string) ?? null,
    careNoun: (row.careNoun as string) ?? null,
    targetKeyword: (row.targetKeyword as string) ?? null,
    metaTitle: (row.metaTitle as string) ?? null,
    metaDescription: (row.metaDescription as string) ?? null,
    heading: (row.heading as string) ?? null,
    intro: (row.intro as string) ?? null,
    body: (row.body as string) ?? null,
    areasHeading: (row.areasHeading as string) ?? null,
    areasBody: (row.areasBody as string) ?? null,
    areasLinks: toLinks(row.areasLinks),
    offerPoints: toPoints(row.offerPoints),
    faqs: toFaqs(row.faqs),
  };
}

// Back-compat shape used by the current callers.
export type AreaContent = {
  heading: string | null;
  intro: string | null;
  body: string | null;
};

const fetchArea = (path: string) =>
  unstable_cache(
    async (): Promise<AreaPageRow | null> => {
      const row = await prisma.areaPage
        .findUnique({ where: { path } })
        .catch(() => null);
      return shape(row as Record<string, unknown> | null);
    },
    [`area:${path}`],
    { tags: ["area-pages", `area:${path}`], revalidate: 60 },
  )();

/** The full AreaPage row for a path (override or managed page), or null. */
export function getAreaPage(path: string) {
  return fetchArea(path);
}

/** Back-compat: just the editable content fields. */
export async function getAreaContent(path: string): Promise<AreaContent | null> {
  const r = await fetchArea(path);
  return r ? { heading: r.heading, intro: r.intro, body: r.body } : null;
}

const fetchManaged = unstable_cache(
  async (): Promise<AreaPageRow[]> => {
    const rows = await prisma.areaPage
      .findMany({ where: { managed: true, published: true } })
      .catch(() => []);
    return (rows as Record<string, unknown>[])
      .map(shape)
      .filter((r): r is AreaPageRow => !!r && !!r.townSlug && !!r.careSlug);
  },
  ["area:managed"],
  { tags: ["area-pages"], revalidate: 60 },
);

/** All published, admin-created pages — for generateStaticParams, cross-links and the sitemap. */
export function getManagedAreaPages() {
  return fetchManaged();
}
