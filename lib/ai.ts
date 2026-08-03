// Minimal Anthropic client via fetch — no SDK dependency. Server-only.
// Needs ANTHROPIC_API_KEY in the environment (Vercel project env var).

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Sonnet 5: strong, fast content model. Change here to swap models.
const MODEL = "claude-sonnet-5";

/**
 * Ask Claude for a JSON object and parse it. Plain text generation with robust parsing:
 * Sonnet 5 rejects `temperature` and assistant prefill, and forced tool use tends to stuff the
 * whole object into one field — so we ask for JSON directly and parse it out of the reply.
 * Throws on missing key / bad response.
 */
export async function generateJson<T = unknown>(
  system: string,
  user: string,
  opts?: { maxTokens?: number },
): Promise<T> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "AI is not configured: set ANTHROPIC_API_KEY in the Ferndale Vercel project.",
    );
  }
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts?.maxTokens ?? 3000,
      system,
      messages: [
        {
          role: "user",
          content: `${user}\n\nRespond with ONLY the JSON object described above: no explanation, no preamble, and no markdown code fences.`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  let text = (data.content ?? [])
    .map((b) => (typeof b?.text === "string" ? b.text : ""))
    .join("")
    .trim();
  // Strip any markdown code fences the model added.
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`AI did not return JSON. Reply: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    throw new Error(`AI returned invalid JSON. Reply: ${text.slice(0, 200)}`);
  }
}
