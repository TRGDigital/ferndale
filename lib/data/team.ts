// Care-team read layer (Option C). Prisma read wrapped in unstable_cache with
// the `team` tag. The admin console adds / edits / removes members and
// revalidates `team`. Falls back to the built-in seed list (lib/content/home)
// when the table is empty, so the site never shows an empty team.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { careTeam, type TeamMember } from "@/lib/content/home";

/** Published team members, in admin sort order. Falls back to the seed list. */
export const getTeam = unstable_cache(
  async (): Promise<TeamMember[]> => {
    const rows = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return careTeam;
    return rows.map((r) => ({
      name: r.name,
      role: r.role,
      bio: r.bio ?? undefined,
      photo: r.photoUrl ?? "",
    }));
  },
  ["team:published"],
  { tags: ["team"], revalidate: 60 },
);
