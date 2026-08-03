// pageMetadata(path, fallback) — builds Next Metadata for a route.
//
// The DB (SitePage) wins; the code `fallback` guarantees meta never breaks if
// the row is missing. Always sets alternates.canonical (SEO convention).

import type { Metadata } from "next";
import { getSitePage } from "@/lib/data/site-pages";
import { getSetting } from "@/lib/data/settings";
import { siteConfig } from "@/lib/site-config";

export type MetaFallback = {
  title: string;
  description?: string;
  ogImageUrl?: string;
  // Use the given title verbatim (no "%s | Site Name" template suffix). For pages that manage
  // their own full title incl. brand (e.g. area landing pages).
  titleAbsolute?: boolean;
  // Skip the SitePage lookup — for routes whose meta lives in another model (e.g. AreaPage).
  ignoreSitePage?: boolean;
};

export async function pageMetadata(
  path: string,
  fallback: MetaFallback,
): Promise<Metadata> {
  const [page, siteOgImage] = await Promise.all([
    fallback.ignoreSitePage
      ? Promise.resolve(null)
      : getSitePage(path).catch(() => null),
    // Site-wide default social image, set in the admin console (SEO tab).
    getSetting("og_image", "").catch(() => ""),
  ]);

  const titleStr = page?.metaTitle ?? page?.title ?? fallback.title;
  const title = fallback.titleAbsolute ? { absolute: fallback.title } : titleStr;
  const description = page?.metaDescription ?? fallback.description;
  // Precedence: this page's own image > the page's code fallback > the
  // admin-set site image > the built-in /opengraph-image.png.
  const ogImage =
    page?.ogImageUrl ?? fallback.ogImageUrl ?? (siteOgImage || undefined);
  const canonical =
    page?.canonicalUrl ?? `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: titleStr,
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
