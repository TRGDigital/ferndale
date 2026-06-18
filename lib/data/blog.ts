// Blog read layer (Option C). Prisma reads wrapped in unstable_cache with tags.
//
// This is the canonical pattern the other lib/data/* helpers copy. Tag
// revalidation (via /api/revalidate) is the real publish mechanism; the
// `revalidate: 60` timer is only a safety net (see CLAUDE.md cache tags).
//
// Tags: `blog` (any post list/changed) and `blog:<slug>` (a single post).

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const POST_INCLUDE = { author: true } as const;

/** All published posts, newest first — for the /blog card list. */
export const getPublishedPosts = unstable_cache(
  async () =>
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: POST_INCLUDE,
    }),
  ["blog:list:published"],
  { tags: ["blog"], revalidate: 60 },
);

/** Slugs of published posts — for generateStaticParams. */
export const getPublishedSlugs = unstable_cache(
  async () =>
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    }),
  ["blog:slugs:published"],
  { tags: ["blog"], revalidate: 60 },
);

/** A single post by slug (any status — caller decides what to do with drafts). */
export function getPostBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.blogPost.findUnique({
        where: { slug },
        include: POST_INCLUDE,
      }),
    ["blog:post", slug],
    { tags: ["blog", `blog:${slug}`], revalidate: 60 },
  )();
}

export type BlogPostWithAuthor = Awaited<
  ReturnType<typeof getPublishedPosts>
>[number];

/** Real photos for the home-page "Life at Ferndale" gallery — reuses the
 *  cover images already migrated from the blog. Links each back to its post. */
export const getGalleryImages = unstable_cache(
  async (limit = 9) => {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", coverImageUrl: { not: null } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        slug: true,
        title: true,
        coverImageUrl: true,
        coverImageAlt: true,
      },
    });
    return posts;
  },
  ["blog:gallery"],
  { tags: ["blog"], revalidate: 60 },
);
