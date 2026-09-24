// Job-vacancy read layer — same unstable_cache + tags pattern as blog.ts.
// Tag: `jobs`. Note: unstable_cache serialises Date -> string, so consumers
// must treat closingDate as Date | string | null.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { idSuffixFromSlug, isJobOpen } from "@/lib/jobs";

export const getPublishedJobs = unstable_cache(
  async () =>
    prisma.jobPosting.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["jobs:published"],
  { tags: ["jobs"], revalidate: 60 },
);

/** Published jobs still open (closing date not yet passed). */
export async function getOpenJobs() {
  const jobs = await getPublishedJobs();
  return jobs.filter((j) => isJobOpen(j));
}

/** One published job by its URL slug (matched on the id suffix, so old
 *  slugs keep resolving after a title edit). Includes closed jobs so the
 *  page can say the role has closed instead of 404ing a shared link. */
export async function getPublishedJobBySlug(slug: string) {
  const suffix = idSuffixFromSlug(slug);
  if (suffix.length < 8) return null;
  const jobs = await getPublishedJobs();
  return jobs.find((j) => j.id.toLowerCase().endsWith(suffix)) ?? null;
}
