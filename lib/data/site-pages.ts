// Site-page read layer — same unstable_cache + tags pattern as blog.ts.
//
// Tags: `site-pages` (any page changed), `page:<path>` (one page), `footer`
// (the footer fields, which the layout reads globally).

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

/** Path of the SitePage record that carries the global footer fields. */
const FOOTER_PAGE_PATH = "/";

/** A single SitePage by path (e.g. "/", "/about/"). */
export function getSitePage(path: string) {
  return unstable_cache(
    async () => prisma.sitePage.findUnique({ where: { path } }),
    ["site-page", path],
    { tags: ["site-pages", `page:${path}`], revalidate: 60 },
  )();
}

/** Every published SitePage — for the sitemap. */
export const getPublishedSitePages = unstable_cache(
  async () =>
    prisma.sitePage.findMany({
      where: { published: true },
      orderBy: { path: "asc" },
    }),
  ["site-pages:published"],
  { tags: ["site-pages"], revalidate: 60 },
);

/** Footer fields, read from the designated SitePage. Carries its own `footer`
 *  tag so footer edits revalidate independently of page-body edits. */
export const getFooter = unstable_cache(
  async () => {
    const page = await prisma.sitePage.findUnique({
      where: { path: FOOTER_PAGE_PATH },
      select: { footer: true },
    });
    return page?.footer ?? null;
  },
  ["site:footer"],
  { tags: ["site-pages", "footer"], revalidate: 60 },
);

export type SitePageRecord = NonNullable<Awaited<ReturnType<typeof getSitePage>>>;
