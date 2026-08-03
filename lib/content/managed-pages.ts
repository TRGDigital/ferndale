// Canonical list of the site's manageable pages (everything except blog posts).
// The admin "Pages" tab lists these merged with any saved SitePage overrides, so
// every page is editable (meta title/description etc.) and new pages appear here
// automatically once added.

import { towns, careTypes } from "@/lib/content/local-areas";

const corePages: { path: string; title: string }[] = [
  { path: "/", title: "Home" },
  { path: "/about-us/", title: "About Us" },
  { path: "/care-team/", title: "Care Team" },
  { path: "/activities/", title: "Activities" },
  { path: "/tools/", title: "Tools" },
  { path: "/funding-calculator/", title: "Care Funding Calculator" },
  { path: "/deferred-payment-calculator/", title: "Deferred Payment Calculator" },
  { path: "/funded-nursing-care/", title: "Funded Nursing Care Checker" },
  { path: "/nhs-continuing-healthcare/", title: "NHS Continuing Healthcare Checker" },
  { path: "/chc-decision-support-tool/", title: "CHC Decision Support Tool Guide" },
  { path: "/dementia-signs/", title: "Dementia Signs Checklist" },
  { path: "/local-council-funding/", title: "Local Council & Funding" },
  { path: "/careers/", title: "Careers" },
  { path: "/blog/", title: "News & Blog" },
  { path: "/privacy-policy/", title: "Privacy Policy" },
  { path: "/cookie-policy/", title: "Cookie Policy" },
  { path: "/terms-and-conditions/", title: "Terms & Conditions" },
  { path: "/contact-us/", title: "Contact Us" },
];

// Local-area landing pages (/{town}/{care}/) — generated from the registry so
// they always stay in sync. Their on-page wording is edited on the "Areas" tab;
// the Pages tab is for their meta title/description.
const areaPages: { path: string; title: string }[] = towns.flatMap((t) =>
  careTypes.map((c) => ({
    path: `/${t.slug}/${c.slug}/`,
    title: `${c.name} in ${t.name}`,
  })),
);

export const managedPages: { path: string; title: string }[] = [
  ...corePages,
  ...areaPages,
];
