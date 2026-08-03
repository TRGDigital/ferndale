// Read layer for the Our Home gallery (Option C: cached Prisma with tag `gallery`).
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type GalleryImageRow = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  sortOrder: number;
};

export const getGalleryImages = unstable_cache(
  async (): Promise<GalleryImageRow[]> => {
    const rows = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      alt: r.alt,
      caption: r.caption,
      sortOrder: r.sortOrder,
    }));
  },
  ["gallery-images"],
  { tags: ["gallery"], revalidate: 60 },
);
