// Admin console navigation — shared by the sidebar (AdminShell) and the page header.
// `key` must match the Tab keys in app/admin/(console)/page.tsx.

export type AdminNavItem = {
  key: string;
  label: string;
  icon: string;
  master?: boolean;
};

export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const adminNav: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ key: "home", label: "Dashboard", icon: "grid" }],
  },
  {
    title: "Enquiries",
    items: [{ key: "leads", label: "Leads", icon: "inbox" }],
  },
  {
    title: "Content",
    items: [
      { key: "posts", label: "Blog posts", icon: "post" },
      { key: "pages", label: "Pages", icon: "page" },
      { key: "areas", label: "Local areas", icon: "pin" },
      { key: "gallery", label: "Gallery", icon: "image" },
      { key: "reviews", label: "Reviews", icon: "star" },
      { key: "authors", label: "Authors", icon: "user" },
      { key: "jobs", label: "Jobs", icon: "briefcase" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { key: "images", label: "Image alt text", icon: "image" },
      { key: "seo", label: "SEO", icon: "search" },
      { key: "legal", label: "Legal pages", icon: "shield" },
      { key: "users", label: "Team access", icon: "users", master: true },
    ],
  },
];

export const adminPageMeta: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "Dashboard",
    subtitle: "An overview of enquiries, content and activity across the Ferndale website.",
  },
  leads: {
    title: "Leads",
    subtitle: "Enquiries submitted through the website. Update their status as you follow up.",
  },
  posts: {
    title: "Blog posts",
    subtitle: "Write, edit and publish articles for the Ferndale blog.",
  },
  pages: {
    title: "Pages",
    subtitle: "Edit the content and copy on the main website pages.",
  },
  areas: {
    title: "Local areas",
    subtitle: "Manage the town and care-type landing pages, with AI-assisted drafting.",
  },
  gallery: {
    title: "Gallery",
    subtitle: "Upload and caption the photos shown across the site and in the home-page gallery.",
  },
  reviews: {
    title: "Reviews",
    subtitle: "Curate the family reviews shown on the site and link out to your review sources.",
  },
  authors: {
    title: "Authors",
    subtitle: "The people credited as authors on blog posts.",
  },
  jobs: {
    title: "Jobs",
    subtitle: "Manage the vacancies shown on the careers page.",
  },
  images: {
    title: "Image alt text",
    subtitle: "Describe key images for accessibility and search engines.",
  },
  seo: {
    title: "SEO",
    subtitle: "Social sharing image and search settings.",
  },
  legal: {
    title: "Legal pages",
    subtitle: "Edit the privacy, cookies and terms content.",
  },
  users: {
    title: "Team access",
    subtitle: "Manage who can sign in to this console.",
  },
};
