// pageMetadata(path, fallback) — builds Next Metadata for a route.
//
// The DB (SitePage) wins; the code `fallback` guarantees meta never breaks if
// the row is missing. Always sets alternates.canonical (SEO convention).

import type { Metadata } from "next";
import { getSitePage } from "@/lib/data/site-pages";
import { siteConfig } from "@/lib/site-config";

export type MetaFallback = {
  title: string;
  description?: string;
  ogImageUrl?: string;
};

export async function pageMetadata(
  path: string,
  fallback: MetaFallback,
): Promise<Metadata> {
  const page = await getSitePage(path).catch(() => null);

  const title = page?.metaTitle ?? page?.title ?? fallback.title;
  const description = page?.metaDescription ?? fallback.description;
  const ogImage = page?.ogImageUrl ?? fallback.ogImageUrl;
  const canonical =
    page?.canonicalUrl ?? `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      // Default to the site OG image when a page has none (setting openGraph
      // here otherwise suppresses Next's file-based opengraph-image injection).
      images: [{ url: ogImage ?? "/opengraph-image.png" }],
    },
  };
}
