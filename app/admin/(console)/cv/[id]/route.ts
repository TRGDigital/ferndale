// Admin-only CV download. Generates a short-lived signed URL for the private
// CV and redirects to it. Requires a valid admin session.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  const meta = (lead?.meta ?? {}) as { cvPath?: string | null };
  if (!meta.cvPath) {
    return NextResponse.json({ error: "no CV on file" }, { status: 404 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "storage not configured" }, { status: 500 });
  }

  const storage = createClient(url, key).storage.from("applications");
  const { data, error } = await storage.createSignedUrl(meta.cvPath, 120);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "could not sign URL" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
