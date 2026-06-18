// On-demand revalidation. Every admin write POSTs here with the tags it
// touched (hard rule #7). Secret-protected via REVALIDATE_SECRET.
//
// Body: { "tags": ["blog", "blog:my-slug"] }  (or { "tag": "blog" }).
// Auth: `x-revalidate-secret` header, or ?secret= query param.

import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-revalidate-secret") ??
    new URL(req.url).searchParams.get("secret");

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    tags?: unknown;
    tag?: unknown;
  };

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : typeof body.tag === "string"
      ? [body.tag]
      : [];

  if (tags.length === 0) {
    return NextResponse.json(
      { error: "no tags provided" },
      { status: 400 },
    );
  }

  // Next 16: revalidateTag now takes a profile. "max" = stale-while-revalidate
  // (recommended); the single-arg form is deprecated. For strict read-your-own-
  // writes on publish, the admin save can use updateTag() from a Server Action.
  for (const tag of tags) revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tags });
}
