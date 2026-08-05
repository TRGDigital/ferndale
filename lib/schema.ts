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
    ...(siteConfig.fees ? { priceRange: siteConfig.fees.priceRange } : {}),
  };
}

/** Guide-fee offers for the /fees/ page — mirrors the visible fee table exactly. */
export function feesSchema() {
  if (!siteConfig.fees) return null;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Organization"],
    "@id": ORG_ID,
    name: siteConfig.name,
    priceRange: siteConfig.fees.priceRange,
    makesOffer: siteConfig.fees.offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceCurrency: "GBP",
        ...("price" in o && o.price != null ? { price: o.price } : {}),
        ...("minPrice" in o && o.minPrice != null ? { minPrice: o.minPrice } : {}),
        ...("maxPrice" in o && o.maxPrice != null ? { maxPrice: o.maxPrice } : {}),
        unitText: "per week",
      },
    })),
  };
}

/** Family reviews for the /reviews/ page. These are USER reviews curated from
 * carehome.co.uk (each Review carries its source publisher) — NOT the CQC rating,
 * which stays display-only per hard rule #4. The aggregate is computed only from
 * the reviews actually shown on the page, so markup mirrors visible content. */
export function reviewsSchema(
  reviews: { author: string; rating: number; title: string | null; body: string; reviewDate: string | Date | null }[],
  source: { name: string; url: string },
) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Organization"],
    "@id": ORG_ID,
    name: siteConfig.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(avg.toFixed(1)),
      bestRating: 5,
      reviewCount: reviews.length,
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      ...(r.reviewDate
        ? { datePublished: new Date(r.reviewDate).toISOString().slice(0, 10) }
        : {}),
      ...(r.title ? { name: r.title } : {}),
      reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      publisher: { "@type": "Organization", name: source.name, url: source.url },
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

/** A local care service (e.g. "Residential Care in Cuckfield") provided by the home. */
export function areaServiceSchema(opts: {
  path: string;
  serviceName: string;
  townName: string;
  description?: string;
}) {
  const url = `${siteConfig.url}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: `${opts.serviceName} in ${opts.townName}`,
    serviceType: opts.serviceName,
    ...(opts.description ? { description: opts.description } : {}),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Place", name: opts.townName },
    url,
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
