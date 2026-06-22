import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedSitePages } from "@/lib/data/site-pages";
import { AREA_PATHS } from "@/lib/content/local-areas";
import { siteConfig } from "@/lib/site-config";

// Static marketing routes always present (trailing slashes — hard rule #1).
const STATIC_PATHS = [
  "/",
  "/about-us/",
  "/care-team/",
  "/activities/",
  "/careers/",
  "/contact-us/",
  "/tools/",
  "/funding-calculator/",
  "/deferred-payment-calculator/",
  "/funded-nursing-care/",
  "/nhs-continuing-healthcare/",
  "/chc-decision-support-tool/",
  "/local-council-funding/",
  "/blog/",
  "/privacy-policy/",
  "/cookie-policy/",
  "/terms-and-conditions/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of [...STATIC_PATHS, ...AREA_PATHS]) {
    entries.set(path, { url: `${base}${path}`, lastModified: now });
  }

  // DB site pages refine lastmod (and add any extra published pages).
  const pages = await getPublishedSitePages().catch(() => []);
  for (const pg of pages) {
    entries.set(pg.path, { url: `${base}${pg.path}`, lastModified: pg.updatedAt });
  }

  // Published blog posts.
  const posts = await getPublishedPosts().catch(() => []);
  for (const p of posts) {
    const path = `/blog/${p.slug}/`;
    entries.set(path, {
      url: `${base}${path}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? now,
    });
  }

  return [...entries.values()];
}
