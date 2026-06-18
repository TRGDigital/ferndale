import { getPublishedPosts } from "@/lib/data/blog";
import { siteConfig } from "@/lib/site-config";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = siteConfig.url;
  const posts = await getPublishedPosts().catch(() => []);

  const items = posts
    .map((p) => {
      const link = `${base}/blog/${p.slug}/`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${p.publishedAt ? `<pubDate>${p.publishedAt.toUTCString()}</pubDate>` : ""}
      ${p.excerpt ? `<description>${esc(p.excerpt)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(siteConfig.name)}: News &amp; Blog</title>
    <link>${base}/blog/</link>
    <description>${esc(siteConfig.description)}</description>
    <language>en-GB</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
