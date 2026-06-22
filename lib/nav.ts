// Primary navigation — single source for the header and siteNavigationSchema.
// Paths confirmed against the live WordPress site (trailing slashes, hard rule #1).

export const primaryNav = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about-us/" },
  { name: "Care Team", path: "/care-team/" },
  { name: "Activities", path: "/activities/" },
  { name: "Tools", path: "/tools/" },
  { name: "Careers", path: "/careers/" },
  { name: "Blog", path: "/blog/" },
  { name: "Contact Us", path: "/contact-us/" },
] as const;
