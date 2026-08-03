// Navigation. `primaryNav` is the flat, complete list (footer, sitemap schema, llms.txt, agent
// tools). `headerNav` is the grouped version with dropdowns used by the desktop header.
// Paths confirmed against the live WordPress site (trailing slashes, hard rule #1).

import { tools } from "@/lib/content/tools";

export const primaryNav = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about-us/" },
  { name: "Our Home", path: "/our-home/", icon: "home" },
  { name: "Care Team", path: "/care-team/", icon: "users" },
  { name: "Reviews", path: "/reviews/", icon: "heart" },
  { name: "Fees & Funding", path: "/fees/", icon: "calculator" },
  { name: "Activities", path: "/activities/" },
  { name: "Tools", path: "/tools/" },
  { name: "Careers", path: "/careers/" },
  { name: "Blog", path: "/blog/" },
  { name: "Contact Us", path: "/contact-us/" },
] as const;

export type NavNode = {
  name: string;
  path: string;
  children?: { name: string; path: string; icon?: string }[];
};

export const headerNav: NavNode[] = [
  { name: "Home", path: "/" },
  {
    name: "About Us",
    path: "/about-us/",
    children: [
      { name: "Our Home", path: "/our-home/", icon: "home" },
      { name: "Care Team", path: "/care-team/", icon: "users" },
      { name: "Reviews", path: "/reviews/", icon: "heart" },
      { name: "Fees & Funding", path: "/fees/", icon: "calculator" },
    ],
  },
  { name: "Activities", path: "/activities/" },
  {
    name: "Tools",
    path: "/tools/",
    children: tools.map((t) => ({ name: t.name, path: t.href, icon: t.icon })),
  },
  { name: "Careers", path: "/careers/" },
  { name: "Blog", path: "/blog/" },
  { name: "Contact Us", path: "/contact-us/" },
];
