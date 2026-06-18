/**
 * Seed SitePage rows (meta + FAQs + footer) for the marketing pages.
 *
 *   npx tsx scripts/seed-site-pages.ts
 *
 * Idempotent (upsert by path). Pages render fine without these rows thanks to
 * the code fallbacks in pageMetadata(); seeding lets the admin edit meta in DB.
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { homeFaqs } from "../lib/content/home-faqs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  }),
});

const PAGES: {
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  faqs?: { question: string; answer: string }[];
}[] = [
  {
    path: "/",
    title: "Home",
    metaTitle: "Crossways Residential Care Home | Lindfield, West Sussex",
    metaDescription:
      "Warm, family-run residential and respite care for people aged 65+ in Lindfield, West Sussex. Care that feels like family.",
    faqs: homeFaqs,
  },
  {
    path: "/about-us/",
    title: "About Us",
    metaTitle: "About Crossways Care Home",
    metaDescription:
      "A warm, family-run residential care home in Lindfield, registered for up to 25 residents aged 65 and over.",
  },
  {
    path: "/care-team/",
    title: "Care Team",
    metaTitle: "Our Care Team",
    metaDescription:
      "Our qualified, experienced team provides 24-hour care to national standards, led by manager Kelvin Amoorthasamy.",
  },
  {
    path: "/activities/",
    title: "Activities",
    metaTitle: "Activities at Crossways",
    metaDescription:
      "A dedicated activities coordinator runs a varied daily programme — crafts, handbell, word games, movement and mobility.",
  },
  {
    path: "/careers/",
    title: "Careers",
    metaTitle: "Careers with Crossways",
    metaDescription:
      "Experienced carer looking for a rewarding role? Crossways offers excellent working conditions in a friendly, family-run home.",
  },
  {
    path: "/contact-us/",
    title: "Contact Us",
    metaTitle: "Contact Crossways Care Home",
    metaDescription:
      "Book a visit, request a brochure, or ask a question. Crossways Residential Care Home, Lindfield, West Sussex.",
  },
  {
    path: "/blog/",
    title: "News & Blog",
    metaTitle: "News & Blog",
    metaDescription:
      "Life, activities and care news from Crossways Residential Care Home in Lindfield, West Sussex.",
  },
];

// Shared footer payload (NAP + accreditations + group link), editable in admin.
const FOOTER = {
  nap: {
    name: "Crossways Residential Care Home",
    street: "2 Sunte Avenue",
    locality: "Lindfield",
    region: "West Sussex",
    postcode: "RH16 2AA",
    phone: "01444 416 841",
    email: "enquiries@crosswayscarehome.co.uk",
  },
  accreditations: ["RNHA", "Food Hygiene Rating", "carehome.co.uk Recommended"],
  sisterHome: { name: "Ferndale Nursing Home", locality: "Crawley" },
};

async function main() {
  for (const p of PAGES) {
    await prisma.sitePage.upsert({
      where: { path: p.path },
      update: {
        title: p.title,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        faqs: p.faqs ?? undefined,
        footer: p.path === "/" ? FOOTER : undefined,
        published: true,
      },
      create: {
        path: p.path,
        title: p.title,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        faqs: p.faqs ?? undefined,
        footer: p.path === "/" ? FOOTER : undefined,
        published: true,
      },
    });
    console.log(`✓ ${p.path}`);
  }
  console.log(`\nSeeded ${PAGES.length} SitePage row(s).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
