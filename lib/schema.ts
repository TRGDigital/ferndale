// Centralised JSON-LD builders. Inject the output with <JsonLd> (see
// components/JsonLd.tsx). Everything is anchored by @id so nodes cross-
// reference each other (LocalBusiness <-> WebSite <-> BlogPosting).
//
// Hard rule #4: the CQC rating is display-only. It NEVER appears here as
// aggregateRating or Review — that would misrepresent a regulatory rating.

import { siteConfig } from "@/lib/site-config";

export type Faq = { question: string; answer: string };

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

/** LocalBusiness profile for the care home — full NAP, geo, areaServed. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Organization"],
    "@id": ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    telephone: siteConfig.telephone,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: siteConfig.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
  };
}

/** WebSite node, cross-referencing the organisation as publisher. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    publisher: { "@id": ORG_ID },
  };
}

/** Primary navigation as SiteNavigationElement. */
export function siteNavigationSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "@id": `${siteConfig.url}/#navigation`,
    name: items.map((i) => i.name),
    url: items.map((i) => `${siteConfig.url}${i.path}`),
  };
}

/** Coerce a Date or ISO string (unstable_cache serialises Dates to strings)
 *  to an ISO string, or undefined if missing/invalid. */
function toISO(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
}

/** BlogPosting for a single article, published by the organisation. */
export function blogPostingSchema(post: {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  author?: { name: string } | null;
}) {
  const url = `${siteConfig.url}/blog/${post.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: toISO(post.publishedAt),
    dateModified: toISO(post.updatedAt ?? post.publishedAt),
    author: post.author
      ? { "@type": "Person", name: post.author.name }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** FAQPage from a list of question/answer pairs. */
export function faqPageSchema(faqs: Faq[], pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl ? `${pageUrl}#faq` : undefined,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** BreadcrumbList helper for nested pages. */
export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteConfig.url}${c.path}`,
    })),
  };
}
