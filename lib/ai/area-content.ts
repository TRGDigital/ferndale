// AI generation of a local-area landing page, grounded strictly in Ferndale's real facts.
// Used by the admin "Generate with AI" action.

import { generateJson } from "@/lib/ai";
import { baseTown } from "@/lib/content/local-areas";

// Ground truth. The model must not contradict or invent beyond this.
const FACTS = `Ferndale Nursing Home is a warm, family-run nursing home for older people aged 65 and over, at 124 Malthouse Road, ${baseTown}, West Sussex (postcode RH10 6BH). It has 28 beds and offers 24-hour nursing care, including specialist dementia and Parkinson's care, plus respite stays. It has a long-standing and qualified nursing and care team, is rated Good by the Care Quality Commission (CQC), and is recommended on carehome.co.uk. It welcomes residents and families from Crawley, Horsham, the Gatwick area and the wider Mid Sussex area. Telephone 01293 520368.`;

export type GeneratedArea = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  body: string;
  offerPoints: string[];
  faqs: { question: string; answer: string }[];
};

export async function generateAreaLandingContent(opts: {
  townName: string;
  careName: string;
  keyword: string;
}): Promise<GeneratedArea> {
  const { townName, careName, keyword } = opts;
  const nounLower = careName.toLowerCase();

  const system =
    "You are an expert UK care-sector SEO copywriter. You write warm, trustworthy, factually-grounded local landing pages for one specific care home. You never invent facts, prices, ratings or services beyond what you are given. Write in British English in a warm, reassuring, family tone aimed at the adult children of older people. Never use em dashes or en dashes; use commas, full stops or the word 'to'.";

  const user = `Write a local landing page for "${careName}" aimed at families near ${townName}, West Sussex, optimised for the search keyword "${keyword}".

FACTS (ground everything in these; do not contradict them or invent anything beyond them):
${FACTS}

Return ONLY a JSON object with exactly these keys:
- "metaTitle": under 60 characters, includes ${townName} and the service.
- "metaDescription": under 155 characters, compelling, includes ${townName}.
- "heading": the H1, natural and specific.
- "intro": one or two short HTML paragraphs wrapped in <p></p> for the hero, mentioning ${townName} and that Ferndale is in ${baseTown}.
- "body": three to four HTML paragraphs wrapped in <p></p> of genuinely useful, reassuring content about choosing ${nounLower} for a loved one near ${townName}, grounded in the facts, with no filler or repetition.
- "offerPoints": an array of 4 to 6 short plain-text bullet strings (no HTML) describing what Ferndale offers for this service.
- "faqs": an array of 3 to 4 objects, each { "question": string, "answer": string }, relevant to ${nounLower} near ${townName}; answers one to three sentences, grounded, with no invented specifics.

Be specific to ${townName} and ${nounLower}, write for people not search engines, and keep every claim honest and grounded in the facts.`;

  let out = await generateJson<Record<string, unknown>>(system, user, {
    maxTokens: 3500,
  });

  // Defensive recovery: if a model ever nests the whole JSON inside one string field,
  // re-parse it so the individual fields still map correctly.
  if (!out.heading && !out.metaTitle && !out.intro) {
    for (const v of Object.values(out)) {
      if (typeof v === "string" && v.includes('"heading"') && v.includes('"metaTitle"')) {
        const s = v.indexOf("{");
        const e = v.lastIndexOf("}");
        if (s >= 0 && e > s) {
          try {
            const reparsed = JSON.parse(v.slice(s, e + 1));
            if (reparsed && typeof reparsed === "object") {
              out = reparsed as Record<string, unknown>;
            }
          } catch {
            /* keep original */
          }
        }
        break;
      }
    }
  }

  const points = Array.isArray(out.offerPoints)
    ? (out.offerPoints as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 6)
    : [];
  const faqs = Array.isArray(out.faqs)
    ? (out.faqs as unknown[])
        .filter(
          (f): f is { question: string; answer: string } =>
            !!f &&
            typeof (f as { question?: unknown }).question === "string" &&
            typeof (f as { answer?: unknown }).answer === "string",
        )
        .slice(0, 4)
    : [];

  return {
    metaTitle: String(out.metaTitle ?? `${careName} in ${townName}`).slice(0, 70),
    metaDescription: String(out.metaDescription ?? "").slice(0, 170),
    heading: String(out.heading ?? `${careName} in ${townName}`),
    intro: String(out.intro ?? ""),
    body: String(out.body ?? ""),
    offerPoints: points,
    faqs,
  };
}
