// Read layer for local-area landing pages — DB override wins over the code
// default. Cached under `area-pages` + `area:<path>`.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type AreaContent = {
  heading: string | null;
  intro: string | null;
  body: string | null;
};

const fetchArea = (path: string) =>
  unstable_cache(
    async (): Promise<AreaContent | null> => {
      const row = await prisma.areaPage
        .findUnique({ where: { path } })
        .catch(() => null);
      return row
        ? { heading: row.heading, intro: row.intro, body: row.body }
        : null;
    },
    [`area:${path}`],
    { tags: ["area-pages", `area:${path}`], revalidate: 60 },
  )();

export function getAreaContent(path: string) {
  return fetchArea(path);
}

/** All saved area overrides (for the admin Areas tab). */
export const getAllAreaContent = unstable_cache(
  async () => {
    return prisma.areaPage
      .findMany({ orderBy: { path: "asc" } })
      .catch(() => [] as Awaited<ReturnType<typeof prisma.areaPage.findMany>>);
  },
  ["area-pages-all"],
  { tags: ["area-pages"], revalidate: 60 },
);
