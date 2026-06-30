// Editable site-wide settings (key/value) read layer (Option C). Prisma read
// wrapped in unstable_cache with the `settings` tag. The admin console upserts
// settings and revalidates `settings`. Callers fall back to code defaults
// (siteConfig) when a key is absent or empty.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

/** All settings as a key -> value map. */
export const getSettings = unstable_cache(
  async () => {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
      string,
      string
    >;
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 60 },
);

/** A single setting value, or the provided fallback when unset/empty. */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const all = await getSettings();
  const v = all[key];
  return v && v.trim() ? v : fallback;
}
