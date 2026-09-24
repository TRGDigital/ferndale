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
  /** One keyword, or several separated by commas. The first is the main one. */
  keyword: string;
  /**
   * Real questions from an AlsoAsked export, already filtered to this page. When
   * present they shape the subheadings and become the FAQs; when absent the FAQs
   * are left alone entirely, so an upload is never needed to refresh the copy.
   */
  questions?: string[];
}): Promise<GeneratedArea> {
  const { townName, careName, keyword, questions = [] } = opts;
  const nounLower = careName.toLowerCase();

  // The admin sends a comma separated list. The first is what the page is written
  // around; the rest are the ones the subheadings have to earn their place with.
  const keywords = keyword
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const primary = keywords[0] ?? keyword;
  const secondary = keywords.slice(1);
  const hasQuestions = questions.length > 0;
  const questionBlock = hasQuestions
    ? `REAL QUESTIONS people search for around this subject, taken from Google's own "people also ask" data. These are the exact words searchers use, so treat them as the brief:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`
    : "";
  const secondaryLine = secondary.length
    ? `Secondary keywords, to be used naturally across the H2 and H3 subheadings and the paragraphs beneath them, one idea per subheading: ${secondary.map((k) => `"${k}"`).join(", ")}.`
    : "There are no secondary keywords, so write subheadings around the questions a family in this area would actually ask.";

  const system =
    "You are an expert UK care-sector SEO copywriter. You write warm, trustworthy, factually-grounded local landing pages for one specific care home. You never invent facts, prices, ratings or services beyond what you are given. Write in British English in a warm, reassuring, family tone aimed at the adult children of older people. Never use em dashes or en dashes; use commas, full stops or the word 'to'.";

  const user = `Write a local landing page for "${careName}" aimed at families near ${townName}, West Sussex, optimised for the search keyword "${primary}".\n\n${secondaryLine}

FACTS (ground everything in these; do not contradict them or invent anything beyond them):
${FACTS}

${questionBlock}

Return ONLY a JSON object with exactly these keys:
- "metaTitle": under 60 characters, includes ${townName} and the service.
- "metaDescription": under 155 characters, compelling, includes ${townName}.
- "heading": the H1, natural and specific.
- "intro": one or two short HTML paragraphs wrapped in <p></p> for the hero, mentioning ${townName} and that Ferndale is in ${baseTown}.
- "body": the main written section, as HTML, structured with subheadings rather than as a wall of paragraphs. Use two or three <h2> subheadings, and under at least one of them a pair of <h3> subheadings. ${hasQuestions ? "Base the subheadings on the real questions above: turn the most relevant ones into headings, keeping the searcher's own wording where it reads naturally, and answer each one in the paragraphs beneath it. " : ""}Every <h2> and <h3> must read like something a person would say out loud, and between them they should work in the keywords above and the place name naturally, never stuffed and never the same phrase twice. Under every subheading write one or two <p> paragraphs of genuinely useful, reassuring content about choosing ${nounLower} for a loved one near ${townName}, grounded in the facts. No filler, no repetition, and do not use <h1> anywhere, because the page already has one.
- "offerPoints": an array of 4 to 6 short plain-text bullet strings (no HTML) describing what Ferndale offers for this service.
- "faqs": ${
    hasQuestions
      ? `an array of 6 to 8 objects, each { "question": string, "answer": string }. Choose the most useful and most relevant questions from the real questions listed above, the ones a family looking for ${nounLower} near ${townName} would actually ask. Keep the searcher's wording where it reads naturally, tidy it only where it reads badly, and do not repeat a question you have already used as a subheading in the body. Answer each in one to three sentences, grounded in the facts, with no invented specifics, and never contradicting anything you have written above.`
      : `an empty array []. No questions were supplied, so do not write any FAQs.`
  }

Be specific to ${townName} and ${nounLower}, write for people not search engines, and keep every claim honest and grounded in the facts. A reader skimming only the subheadings should still understand what you offer and where.`;

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
        .slice(0, 8)
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
