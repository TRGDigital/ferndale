// Job application endpoint — accepts multipart/form-data with an optional CV
// file. The CV goes to the PRIVATE `applications` bucket (personal data — never
// public); the lead stores the file path in meta, retrievable later via a
// signed URL. Falls back gracefully if no file is attached.

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const MAX_CV_BYTES = 4 * 1024 * 1024; // 4MB (under Vercel's request limit)
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const str = (k: string) => String(form.get(k) ?? "").trim();
  const name = [str("firstName"), str("lastName")].filter(Boolean).join(" ");
  const email = str("email");
  const phone = str("phone");
  const position = str("position");
  const note = str("message");

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

  // Optional CV upload to the private bucket.
  let cv: { path: string; name: string } | null = null;
  const file = form.get("cv");
  if (file && file instanceof File && file.size > 0) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "CV must be a PDF or Word document." },
        { status: 400 },
      );
    }
    if (file.size > MAX_CV_BYTES) {
      return NextResponse.json(
        { error: "CV must be 4MB or smaller." },
        { status: 400 },
      );
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const storage = createClient(url, key).storage.from("applications");
      const path = `cvs/${Date.now()}-${randomUUID()}-${safeName(file.name)}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error } = await storage.upload(path, buf, {
        contentType: file.type,
        upsert: false,
      });
      if (!error) cv = { path, name: file.name };
    }
  }

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        message: position ? `Position: ${position}\n\n${note}` : note || null,
        intent: "CAREERS",
        source: "/careers/",
        meta: {
          userAgent: req.headers.get("user-agent") ?? null,
          ip,
          position: position || null,
          cvPath: cv?.path ?? null,
          cvName: cv?.name ?? null,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save your application. Please email us." },
      { status: 500 },
    );
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    void fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, cv: cv?.name ?? null }),
    }).catch(() => {});
  }

  return NextResponse.json(
    { ok: true, id: lead.id, cv: cv?.name ?? null },
    { status: 201 },
  );
}
