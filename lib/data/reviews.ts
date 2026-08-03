// Read layer for curated reviews (Option C: cached Prisma, tag `reviews`).
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type ReviewRow = {
  id: string;
  author: string;
  relationship: string | null;
  rating: number;
  title: string | null;
  body: string;
  reviewDate: string | null; // ISO
  featured: boolean;
  sortOrder: number;
};

function shape(r: {
  id: string;
  author: string;
  relationship: string | null;
  rating: number;
  title: string | null;
  body: string;
  reviewDate: Date | null;
  featured: boolean;
  sortOrder: number;
}): ReviewRow {
  return {
    id: r.id,
    author: r.author,
    relationship: r.relationship,
    rating: r.rating,
    title: r.title,
    body: r.body,
    reviewDate: r.reviewDate ? r.reviewDate.toISOString() : null,
    featured: r.featured,
    sortOrder: r.sortOrder,
  };
}

export const getReviews = unstable_cache(
  async (): Promise<ReviewRow[]> => {
    const rows = await prisma.review.findMany({
      orderBy: [{ sortOrder: "asc" }, { reviewDate: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(shape);
  },
  ["all-reviews"],
  { tags: ["reviews"], revalidate: 60 },
);

export const getFeaturedReviews = unstable_cache(
  async (): Promise<ReviewRow[]> => {
    const rows = await prisma.review.findMany({
      where: { featured: true },
      orderBy: [{ sortOrder: "asc" }, { reviewDate: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(shape);
  },
  ["featured-reviews"],
  { tags: ["reviews"], revalidate: 60 },
);

/** Aggregate rating + count across all reviews (for the reviews page + schema). */
export async function getReviewStats(): Promise<{ count: number; average: number }> {
  const reviews = await getReviews();
  if (!reviews.length) return { count: 0, average: 0 };
  const sum = reviews.reduce((n, r) => n + (r.rating || 0), 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}
