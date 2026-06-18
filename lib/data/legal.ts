// Legal-page read layer — DB override wins over the code default, same
// philosophy as pageMetadata(). Cached under `legal` + `legal:<slug>`.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  legalDefaults,
  type LegalSlug,
} from "@/lib/content/legal";

export type LegalView = {
  slug: string;
  title: string;
  content: string;
  updatedAt: Date | string | null;
};

const fetchLegal = (slug: string) =>
  unstable_cache(
    async (): Promise<LegalView | null> => {
      const row = await prisma.legalPage
        .findUnique({ where: { slug } })
        .catch(() => null);
      const fallback = legalDefaults[slug as LegalSlug];
      if (row) {
        return {
          slug: row.slug,
          title: row.title,
          content: row.content,
          updatedAt: row.updatedAt,
        };
      }
      if (fallback) {
        return { slug, title: fallback.title, content: fallback.content, updatedAt: null };
      }
      return null;
    },
    [`legal:${slug}`],
    { tags: ["legal", `legal:${slug}`], revalidate: 60 },
  )();

export function getLegalPage(slug: string) {
  return fetchLegal(slug);
}
