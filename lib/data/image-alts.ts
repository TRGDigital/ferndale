// Image-alt read layer — same unstable_cache + tags pattern as blog.ts.
//
// Returns a { src -> alt } map that <AltMapProvider> hydrates so <SiteImage>
// can resolve managed alt text. Tag: `image-alts`.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type AltMap = Record<string, string>;

/** All managed alt text as a { src -> alt } lookup. */
export const getImageAltMap = unstable_cache(
  async (): Promise<AltMap> => {
    const rows = await prisma.siteImageAlt.findMany({
      select: { src: true, alt: true },
    });
    return Object.fromEntries(rows.map((r) => [r.src, r.alt]));
  },
  ["image-alts:map"],
  { tags: ["image-alts"], revalidate: 60 },
);
