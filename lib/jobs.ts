// Pure helpers for job vacancies: per-job URLs, open/closed state, and the
// free-text -> structured mapping that JobPosting schema needs.
//
// A job's URL is /careers/<title-slug>-<id suffix>/. The id suffix is what
// identifies the job, so editing a title changes the slug but old links still
// resolve (the page 308s to the current slug). No DB migration needed.

type JobLike = { id: string; title: string; closingDate?: Date | string | null };

const ID_SUFFIX_LEN = 8;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function jobSlug(job: JobLike) {
  const suffix = job.id.slice(-ID_SUFFIX_LEN).toLowerCase();
  const base = slugify(job.title).slice(0, 60).replace(/-$/, "");
  return base ? `${base}-${suffix}` : suffix;
}

export function jobPath(job: JobLike) {
  return `/careers/${jobSlug(job)}/`;
}

/** The id suffix at the end of a job slug (what we look the job up by). */
export function idSuffixFromSlug(slug: string) {
  return slug.slice(-ID_SUFFIX_LEN).toLowerCase();
}

function toDate(d: Date | string | null | undefined) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** End of the closing day (UK time), so a job closing "30 September" stays
 *  open all that day. Null when there's no closing date. */
export function closesAt(job: JobLike) {
  const d = toDate(job.closingDate);
  if (!d) return null;
  const day = d.toISOString().slice(0, 10);
  return new Date(`${day}T23:59:59Z`);
}

export function isJobOpen(job: JobLike, now = new Date()) {
  const end = closesAt(job);
  return !end || end.getTime() >= now.getTime();
}

/** Admin "type" free text -> schema.org employmentType values. */
export function employmentTypes(type: string | null | undefined): string[] {
  if (!type) return [];
  const t = type.toLowerCase();
  const out = new Set<string>();
  if (/full[\s-]?time/.test(t)) out.add("FULL_TIME");
  if (/part[\s-]?time/.test(t)) out.add("PART_TIME");
  if (/\bbank\b|zero[\s-]?hours?|relief|as required/.test(t)) out.add("PER_DIEM");
  if (/temp|fixed[\s-]?term|maternity|cover/.test(t)) out.add("TEMPORARY");
  if (/contractor|self[\s-]?employed|freelance/.test(t)) out.add("CONTRACTOR");
  if (/intern|apprentice/.test(t)) out.add("INTERN");
  if (/volunteer/.test(t)) out.add("VOLUNTEER");
  return [...out];
}

export type Salary = {
  unitText: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
  value?: number;
  minValue?: number;
  maxValue?: number;
};

/** Parse admin salary text such as "£12.50 per hour", "£12.21 - £13.50/hr",
 *  "£24,000 to £27,000 per annum" or "Up to £14 an hour". Returns null when
 *  the text isn't clear enough, so we never publish a made-up figure. */
export function parseSalary(text: string | null | undefined): Salary | null {
  if (!text) return null;
  const t = text.toLowerCase();

  const nums = [...t.matchAll(/£\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d{1,2})?)(k)?/g)].map(
    (m) => Number(m[1].replace(/,/g, "")) * (m[2] ? 1000 : 1),
  );
  if (!nums.length || nums.some((n) => !Number.isFinite(n) || n <= 0)) return null;

  let unitText: Salary["unitText"] | null = null;
  if (/hour|\/\s?hr|\bph\b|p\/h/.test(t)) unitText = "HOUR";
  else if (/per day|a day|\/\s?day|daily|per shift/.test(t)) unitText = "DAY";
  else if (/week|pw\b|p\/w/.test(t)) unitText = "WEEK";
  else if (/month|pcm/.test(t)) unitText = "MONTH";
  else if (/annum|year|annual|\bpa\b|p\/a/.test(t)) unitText = "YEAR";
  else {
    // No unit given: infer from size (care pay is hourly or annual).
    const max = Math.max(...nums);
    if (max < 100) unitText = "HOUR";
    else if (max >= 10000) unitText = "YEAR";
  }
  if (!unitText) return null;

  if (nums.length >= 2) {
    const [a, b] = nums;
    return { unitText, minValue: Math.min(a, b), maxValue: Math.max(a, b) };
  }
  return { unitText, value: nums[0] };
}
