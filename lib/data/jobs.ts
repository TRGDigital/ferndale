// Job-vacancy read layer — same unstable_cache + tags pattern as blog.ts.
// Tag: `jobs`. Note: unstable_cache serialises Date -> string, so consumers
// must treat closingDate as Date | string | null.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const getPublishedJobs = unstable_cache(
  async () =>
    prisma.jobPosting.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["jobs:published"],
  { tags: ["jobs"], revalidate: 60 },
);
