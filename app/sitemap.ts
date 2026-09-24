import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedSitePages } from "@/lib/data/site-pages";
import { AREA_PATHS } from "@/lib/content/local-areas";
import { getManagedAreaPages, getUnpublishedBuiltInPaths } from "@/lib/data/area-pages";
import { siteConfig } from "@/lib/site-config";
import { getOpenJobs } from "@/lib/data/jobs";
import { jobPath } from "@/lib/jobs";

// Static marketing routes always present (trailing slashes — hard rule #1).
const STATIC_PATHS = [
  "/",
  "/about-us/",
  "/care-team/",
  "/areas-we-serve/",
  "/activities/",
  "/referrers/",
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

  // Built-in area pages are live unless the admin has unpublished one.
  const hidden = new Set(await getUnpublishedBuiltInPaths().catch(() => []));
  for (const path of [...STATIC_PATHS, ...AREA_PATHS]) {
    if (hidden.has(path)) continue;
    entries.set(path, { url: `${base}${path}`, lastModified: now });
  }

  // Published, admin-created local-area landing pages (no redeploy needed to add one).
  const areaPages = await getManagedAreaPages().catch(() => []);
  for (const a of areaPages) {
    entries.set(a.path, { url: `${base}${a.path}`, lastModified: now });
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

  // Open job vacancies (closed roles drop out; their pages are noindex).
  const jobs = await getOpenJobs().catch(() => []);
  for (const j of jobs) {
    const path = jobPath(j);
    entries.set(path, { url: `${base}${path}`, lastModified: j.updatedAt ?? now });
  }

  return [...entries.values()];
}
