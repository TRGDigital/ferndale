// Reads an AlsoAsked CSV export into a clean list of questions for the AI to work
// from. Nothing is stored: the file is parsed in the request that uploads it and
// then discarded.
//
// The exports vary (columns get added, order changes, some are exported per search
// term and some as one big file), so the question column is found by name rather
// than position, and a "search term" column, when present, is used to narrow a big
// export down to the rows that belong to the page being written.

export type AlsoAskedQuestion = {
  question: string;
  /** 1 = asked directly about the search term, 2+ = a follow-on question. */
  depth: number;
  searchTerm: string;
};

/** Hard caps, so a 5,000 row export cannot blow up the prompt. */
const MAX_ROWS = 2000;
const MAX_QUESTIONS = 40;

/** Minimal RFC4180 parser: handles quoted fields, escaped quotes and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  // A BOM on a file exported from a spreadsheet would otherwise poison the first header.
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
      if (rows.length > MAX_ROWS) break;
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

function findColumn(header: string[], names: string[], fallbackContains?: string) {
  const cols = header.map(norm);
  for (const n of names) {
    const i = cols.indexOf(norm(n));
    if (i >= 0) return i;
  }
  if (fallbackContains) {
    const i = cols.findIndex((c) => c.includes(norm(fallbackContains)));
    if (i >= 0) return i;
  }
  return -1;
}

/** Everything in the file, before any filtering by town or service. */
export function readAlsoAskedCsv(text: string): AlsoAskedQuestion[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0]!;
  const qi = findColumn(header, ["question", "questions", "text"], "question");
  if (qi < 0) return [];
  const di = findColumn(header, ["depth", "level"], "depth");
  const si = findColumn(header, ["search term", "searchterm", "term", "query", "keyword"], "term");

  const seen = new Set<string>();
  const out: AlsoAskedQuestion[] = [];

  for (const r of rows.slice(1)) {
    const question = (r[qi] ?? "").trim().replace(/\s+/g, " ");
    if (question.length < 8 || question.length > 180) continue;
    // Near-duplicate questions are common across depths: same words, different case
    // or a trailing question mark.
    const key = question.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const depth = Number.parseInt((r[di] ?? "").trim(), 10);
    out.push({
      question,
      depth: Number.isFinite(depth) && depth > 0 ? depth : 1,
      searchTerm: (r[si] ?? "").trim(),
    });
  }
  return out;
}

/**
 * Narrow a whole-account export down to the questions worth showing the model for
 * one page, then order them so the most directly asked come first.
 *
 * `terms` are the things this page is about: the town, the service, the keywords.
 * If the file has a search term column and any row matches, only matching rows are
 * used; otherwise the whole file is used, which is what a per-page export needs.
 */
export function selectQuestions(
  all: AlsoAskedQuestion[],
  terms: string[],
  limit = MAX_QUESTIONS,
): string[] {
  const wanted = terms.map((t) => t.toLowerCase().trim()).filter(Boolean);
  const matchesTerm = (q: AlsoAskedQuestion) =>
    !!q.searchTerm && wanted.some((t) => q.searchTerm.toLowerCase().includes(t));

  const scoped = all.some(matchesTerm) ? all.filter(matchesTerm) : all;

  // Depth 1 first (asked about the term itself), then by how much of the page's own
  // subject matter the question mentions.
  const score = (q: AlsoAskedQuestion) => {
    const text = q.question.toLowerCase();
    const hits = wanted.filter((t) => t && text.includes(t)).length;
    return (q.depth === 1 ? 10 : 0) + hits * 3 - q.depth;
  };

  return scoped
    .slice()
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
    .map((q) => q.question);
}
