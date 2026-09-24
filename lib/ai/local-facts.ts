// Candidate local facts for an area page.
//
// A deliberate departure from how the rest of the AI here works. Everywhere else the
// model is held to facts we supply and forbidden from inventing. This asks it for
// things we do NOT already know, which is exactly the situation where a model makes
// things up: a plausible road name, a hospital that closed, a council that covers the
// next district over.
//
// So nothing here is written to the page. The model returns candidates, each one
// labelled with how confident it is and what to check, and a person ticks the ones
// that are true. Treat everything this returns as a suggestion to verify, never as a
// fact, and never publish it unchecked.

import { generateJson } from "@/lib/ai";

export type FactCandidate = {
  fact: string;
  /** route, landmark, council, health, transport, parking, community */
  category: string;
  /** high = a model should reliably know this; low = plausible but must be checked. */
  confidence: "high" | "low";
  /** What to search for to confirm it. */
  check: string;
};

const CATEGORIES = [
  "route (how people drive here from that place, named roads, rough journey time)",
  "landmark (what locals navigate by: a pub, a church, a park, a parade of shops)",
  "council (which authority handles social care assessments there)",
  "health (nearest hospital, where discharges come from, local GP surgeries)",
  "transport (bus routes, nearest station, what visiting without a car looks like)",
  "parking (what parking is like for visitors)",
  "community (groups, memory cafes, churches, anything families would recognise)",
];

export async function suggestLocalFacts(opts: {
  townName: string;
  careName: string;
  /** Where the home actually is, so routes are described in the right direction. */
  homeLocation: string;
}): Promise<FactCandidate[]> {
  const { townName, careName, homeLocation } = opts;

  const system =
    "You are a UK local knowledge researcher helping write a local page for a care home. You are precise about what you do and do not know. You would rather return eight facts you are sure of than fifteen that sound right. You never state a distance, a journey time, a road name or an organisation name you are not confident about, and you mark anything uncertain as low confidence. British English throughout. Never use em dashes or en dashes.";

  const user = `List local facts about ${townName}, West Sussex, that would be useful and genuine on a page about ${careName} for families in ${townName}. The care home itself is at ${homeLocation}, so describe routes and distances from ${townName} to there, in that direction.

Cover a spread of these categories:
${CATEGORIES.map((c) => `- ${c}`).join("\n")}

Return ONLY a JSON object of the form { "facts": [ ... ] }, where each item is:
- "fact": one sentence, specific and concrete, as a note rather than marketing copy. Name the actual road, place or organisation.
- "category": one of route, landmark, council, health, transport, parking, community.
- "confidence": "high" only where you are genuinely confident this is correct and current. "low" for anything you are inferring, half remembering, or that may have changed.
- "check": the exact search someone should run to confirm it, for example "Princess Royal Hospital Haywards Heath" or "West Sussex County Council adult social care assessment".

Give 12 to 15 items. Do not invent a journey time to the minute; approximate and mark it low confidence. Do not include anything about the care home itself, its rating, its beds or its team, because we already have those. Do not repeat the same fact in different words.`;

  const out = await generateJson<{ facts?: unknown }>(system, user, { maxTokens: 3000 });
  const raw = Array.isArray(out.facts) ? out.facts : [];

  const seen = new Set<string>();
  const facts: FactCandidate[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const fact = typeof o.fact === "string" ? o.fact.trim() : "";
    if (fact.length < 15 || fact.length > 320) continue;
    const key = fact.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    if (seen.has(key)) continue;
    seen.add(key);
    facts.push({
      fact,
      category: typeof o.category === "string" ? o.category.toLowerCase().trim() : "other",
      confidence: o.confidence === "high" ? "high" : "low",
      check: typeof o.check === "string" ? o.check.trim() : `${fact.slice(0, 60)} ${townName}`,
    });
    if (facts.length >= 15) break;
  }
  return facts;
}
