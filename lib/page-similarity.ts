// Keeping the local area pages from turning into the same page with the town name
// swapped. Two jobs:
//
//   angles()     — what a page already says, compressed to its subheadings and the
//                  first line of each section. Fed to the AI when writing the next
//                  page, as a list of things not to do again.
//   similarity() — how alike two pages actually are, so the admin can say "this is
//                  71% the same as Langley Green" instead of nobody noticing until
//                  Google does.
//
// Both work on plain text, so neither cares whether the content came from the AI,
// the code defaults or a human.

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The subheadings and section openers of a page, as short lines. */
export function angles(html: string, limit = 8): string[] {
  const out: string[] = [];
  const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map((m) =>
    stripHtml(m[1] ?? ""),
  );
  for (const h of headings) if (h) out.push(h);

  // The opening sentence carries the angle even when a page has no headings.
  const firstPara = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  if (firstPara) {
    const text = stripHtml(firstPara[1] ?? "");
    const sentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
    if (sentence.length > 25) out.unshift(sentence.slice(0, 160));
  }
  return out.filter(Boolean).slice(0, limit);
}

function shingles(text: string, n = 5): Set<string> {
  const words = stripHtml(text)
    .toLowerCase()
    .replace(/[^a-z' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(" "));
  return out;
}

/**
 * 0 to 1, how much of the shorter page appears word for word in the longer one.
 * Overlap rather than Jaccard, because a short page lifted wholesale from a long
 * one is exactly the case worth catching.
 */
export function similarity(a: string, b: string): number {
  const sa = shingles(a);
  const sb = shingles(b);
  if (!sa.size || !sb.size) return 0;
  let shared = 0;
  for (const s of sa) if (sb.has(s)) shared++;
  return shared / Math.min(sa.size, sb.size);
}

export type SimilarPage = { path: string; score: number };

/** The page this one most resembles, if any is above the threshold. */
export function closestPage(
  text: string,
  others: { path: string; text: string }[],
  threshold = 0.35,
): SimilarPage | null {
  let best: SimilarPage | null = null;
  for (const o of others) {
    const score = similarity(text, o.text);
    if (score >= threshold && (!best || score > best.score)) best = { path: o.path, score };
  }
  return best;
}
