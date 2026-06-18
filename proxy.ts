import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// Proxy always runs on the Node.js runtime (so the Prisma pg adapter is fine).
export const config = {
  // Skip _next internals, API routes, and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\.).*)"],
};

type Hit = { destination: string; statusCode: number };

// In-memory map cached with a short TTL so we don't hit the DB per request.
let cache: { map: Map<string, Hit>; at: number } | null = null;
const TTL_MS = 60_000;

async function getRedirectMap(): Promise<Map<string, Hit>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  const rows = await prisma.redirect.findMany({
    select: { source: true, destination: true, statusCode: true },
  });
  const map = new Map<string, Hit>(
    rows.map((r) => [
      r.source,
      { destination: r.destination, statusCode: r.statusCode },
    ]),
  );
  cache = { map, at: Date.now() };
  return map;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let map: Map<string, Hit>;
  try {
    map = await getRedirectMap();
  } catch {
    // DB unreachable — never block the request over a redirect lookup.
    return NextResponse.next();
  }

  const hit = map.get(pathname);
  if (hit) {
    return NextResponse.redirect(
      new URL(hit.destination, req.url),
      hit.statusCode,
    );
  }
  return NextResponse.next();
}
