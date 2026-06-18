// llms.txt — a concise, link-rich site summary for AI assistants
// (see llmstxt.org). Served at /llms.txt.

import { getPublishedPosts } from "@/lib/data/blog";
import { siteConfig } from "@/lib/site-config";
import { primaryNav } from "@/lib/nav";

export async function GET() {
  const base = siteConfig.url;
  const posts = await getPublishedPosts().catch(() => []);

  const pages = primaryNav
    .map((n) => `- [${n.name}](${base}${n.path})`)
    .join("\n");

  const blog = posts
    .map((p) => `- [${p.title}](${base}/blog/${p.slug}/)`)
    .join("\n");

  const { address } = siteConfig;
  const md = `# ${siteConfig.name}

> ${siteConfig.description} CQC rated Good. Provider: ${siteConfig.legalName}.

## Key pages
${pages}

## Blog
${blog || "- (no posts yet)"}

## Contact
- Phone: ${siteConfig.telephone}
- Email: ${siteConfig.email}
- Address: ${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}
- Areas served: ${siteConfig.areaServed.join(", ")}
`;

  return new Response(md, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
