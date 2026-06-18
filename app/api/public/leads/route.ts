// Public lead capture. POST JSON -> validates -> writes a Lead row.
// Optional fire-and-forget webhook to an email/CRM endpoint (LEAD_WEBHOOK_URL).
// Rate-limited per IP (best-effort, in-memory — resets per instance).

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    str(body.name) ||
    [str(body.firstName), str(body.lastName)].filter(Boolean).join(" ");
  const email = str(body.email);
  const phone = str(body.phone);

  // Need a name and at least one way to reply.
  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: "Please provide your name and an email or phone number." },
      { status: 400 },
    );
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const intent =
    body.intent === "BROCHURE" || body.intent === "CAREERS"
      ? body.intent
      : "BOOK_VISIT";

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        message: str(body.message) || null,
        intent,
        source: str(body.source) || null,
        meta: {
          userAgent: req.headers.get("user-agent") ?? null,
          ip,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save your message. Please call us." },
      { status: 500 },
    );
  }

  // Optional: notify an email/CRM endpoint. Never block the response on it.
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    void fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, createdAt: lead.createdAt }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
