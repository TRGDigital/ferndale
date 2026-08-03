// Server-side processing of a blog post's migrated HTML body:
//  - demotes a stray body <h1> to <h2> so the page keeps a single H1 (the title);
//  - gives every h2/h3 a stable id anchor;
//  - returns a flat table of contents so the page can render an in-page nav.
// Regex-based on purpose: the content is trusted, sanitised-at-source WordPress
// HTML and we only touch the heading tags, leaving everything else untouched.

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// Decode the handful of HTML entities that show up in migrated WordPress headings,
// so the table-of-contents label reads as text (e.g. "&#8211;" -> "–") rather than
// the raw entity, which React would otherwise escape and print literally.
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n: string) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&(mdash|ndash);/g, "–")
    .replace(/&(lsquo|rsquo|apos);/g, "’")
    .replace(/&(ldquo|rdquo);/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&"); // must be last
}

function slugify(raw: string): string {
  const base = raw
    .replace(/<[^>]+>/g, " ") // strip any inner markup (e.g. <strong>)
    .replace(/&[a-z]+;/gi, " ") // drop entities
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "section";
}

export function processBlogContent(html: string): {
  html: string;
  toc: TocItem[];
} {
  if (!html) return { html: "", toc: [] };

  const toc: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h([1-3])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr: string, attrs: string, inner: string) => {
      // A migrated body <h1> collides with the page title's H1 — demote to H2.
      const level = Number(levelStr) === 1 ? 2 : (Number(levelStr) as 2 | 3);

      const text = decodeEntities(
        inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " "),
      ).trim();

      // Headings with no readable text (e.g. an icon) aren't useful TOC targets.
      if (!text) return `<h${level}${attrs}>${inner}</h${level}>`;

      let id = slugify(text);
      if (used.has(id)) {
        let n = 2;
        while (used.has(`${id}-${n}`)) n += 1;
        id = `${id}-${n}`;
      }
      used.add(id);
      toc.push({ id, text, level });

      // Keep existing attributes but replace any pre-existing id with ours.
      const cleanedAttrs = attrs.replace(/\sid=("[^"]*"|'[^']*')/i, "");
      return `<h${level}${cleanedAttrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: out, toc };
}
