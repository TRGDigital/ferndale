/**
 * WordPress -> Supabase blog migration.
 *
 *   npx tsx scripts/migrate-wordpress.ts --dry-run   # ALWAYS run this first
 *   npx tsx scripts/migrate-wordpress.ts             # real run (writes DB + Storage)
 *
 * What it does (real run):
 *   - pulls every post from the WP REST API (paginated, _embed for author/media)
 *   - re-hosts the featured image + every inline <img> into Supabase Storage
 *     (hard rule #6: never hotlink the WP host) and rewrites the URLs in content
 *   - upserts BlogAuthor (by slug) and BlogPost (idempotent by wpId)
 *   - seeds a 301 Redirect from the old <prefix>/<slug>/ path to /blog/<slug>/
 *
 * Dry-run reads the public WP API only — no credentials, no writes.
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const WP_BASE = (process.env.WP_SOURCE_URL ?? "").replace(/\/$/, "");
const BUCKET = process.env.WP_STORAGE_BUCKET ?? "blog";
const REDIRECT_PREFIX = process.env.WP_REDIRECT_PREFIX ?? "/news";

// ── WP REST types (only the bits we use) ──────────────────────────────────
type WpRendered = { rendered: string };
type WpPost = {
  id: number;
  date_gmt: string;
  modified_gmt: string;
  slug: string;
  link: string;
  status: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  _embedded?: {
    author?: { id: number; name: string; slug: string; description?: string; avatar_urls?: Record<string, string> }[];
    "wp:featuredmedia"?: { source_url: string; alt_text?: string }[];
  };
};

// ── helpers ────────────────────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8211;|&#8212;/g, "–")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function imageUrls(html: string): string[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    if (m[1].startsWith("http")) urls.add(m[1]);
  }
  return [...urls];
}

async function fetchAllPosts(): Promise<WpPost[]> {
  if (!WP_BASE) throw new Error("WP_SOURCE_URL is not set");
  const posts: WpPost[] = [];
  for (let page = 1; ; page++) {
    const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=author,wp:featuredmedia&status=publish`;
    const res = await fetch(url);
    if (res.status === 400 || res.status === 404) break; // past the last page
    if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${url}`);
    const batch = (await res.json()) as WpPost[];
    if (batch.length === 0) break;
    posts.push(...batch);
    const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
    if (page >= totalPages) break;
  }
  return posts;
}

// ── clients (real run only) ──────────────────────────────────────────────
function makePrisma() {
  // Bulk writes go over the direct connection (hard rule #3).
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function makeStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for a real run");
  }
  return createClient(url, key).storage.from(BUCKET);
}

type Storage = ReturnType<typeof makeStorage>;

async function rehostImage(
  storage: Storage,
  wpId: number,
  srcUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const filename = srcUrl.split("/").pop()?.split("?")[0] ?? "image";
    const path = `posts/${wpId}/${filename}`;
    const { error } = await storage.upload(path, buf, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.warn(`  ! upload failed for ${srcUrl}: ${error.message}`);
      return null;
    }
    return storage.getPublicUrl(path).data.publicUrl;
  } catch (e) {
    console.warn(`  ! rehost error for ${srcUrl}: ${(e as Error).message}`);
    return null;
  }
}

// ── main ────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    `\n${DRY_RUN ? "DRY RUN" : "LIVE RUN"} — source: ${WP_BASE || "(unset)"}\n`,
  );

  const posts = (await fetchAllPosts()).slice(0, LIMIT);
  console.log(`Found ${posts.length} published post(s).\n`);

  const prisma = DRY_RUN ? null : makePrisma();
  const storage = DRY_RUN ? null : makeStorage();
  const authorCache = new Map<number, string>(); // wp author id -> our author id

  let migrated = 0;
  let imagesSeen = 0;
  let imagesRehosted = 0;

  for (const p of posts) {
    const title = decodeEntities(p.title.rendered);
    const author = p._embedded?.author?.[0];
    const featured = p._embedded?.["wp:featuredmedia"]?.[0];
    const inlineImages = imageUrls(p.content.rendered);
    const allImages = [
      ...(featured?.source_url ? [featured.source_url] : []),
      ...inlineImages,
    ];
    imagesSeen += allImages.length;
    const faqHint = /faq|frequently asked/i.test(p.content.rendered);

    const newPath = `/blog/${p.slug}/`;
    let oldPath = newPath;
    try {
      oldPath = new URL(p.link).pathname;
    } catch {
      oldPath = `${REDIRECT_PREFIX}/${p.slug}/`;
    }
    const needsRedirect = oldPath !== newPath;

    console.log(
      `• [${p.id}] ${title}\n` +
        `    ${oldPath} -> ${newPath}  ${needsRedirect ? "(301 redirect)" : "(url preserved)"}\n` +
        `    status=${p.status}  author=${author?.name ?? "—"}  images: ${allImages.length}` +
        `${faqHint ? "  (mentions FAQ — review)" : ""}`,
    );

    if (DRY_RUN || !prisma || !storage) continue;

    // 1) author
    let authorId: string | undefined;
    if (author) {
      if (authorCache.has(author.id)) {
        authorId = authorCache.get(author.id);
      } else {
        const a = await prisma.blogAuthor.upsert({
          where: { slug: author.slug },
          update: { name: author.name, bio: author.description || null },
          create: {
            slug: author.slug,
            name: author.name,
            bio: author.description || null,
            avatarUrl: author.avatar_urls?.["96"] ?? null,
          },
        });
        authorId = a.id;
        authorCache.set(author.id, a.id);
      }
    }

    // 2) images -> Supabase Storage, rewrite content
    let content = p.content.rendered;
    let coverImageUrl: string | null = null;
    for (const src of allImages) {
      const publicUrl = await rehostImage(storage, p.id, src);
      if (!publicUrl) continue;
      imagesRehosted++;
      content = content.split(src).join(publicUrl);
      if (featured && src === featured.source_url) coverImageUrl = publicUrl;
    }

    // 2b) Strip WP responsive variants (srcset/sizes) — the rehosted src still
    //     renders the image, and this removes the remaining WP hotlinks.
    content = content
      .replace(/\s+srcset="[^"]*"/gi, "")
      .replace(/\s+sizes="[^"]*"/gi, "");

    // 2c) Safety net: rehost any wp-content image URL still left in the content
    //     (e.g. a non-<img> reference or one that failed first time).
    const leftover = [
      ...new Set(
        [...content.matchAll(/https?:\/\/[^"'() ]*\/wp-content\/[^"'() ]+\.(?:jpe?g|png|gif|webp)/gi)].map(
          (m) => m[0],
        ),
      ),
    ];
    for (const src of leftover) {
      const publicUrl = await rehostImage(storage, p.id, src);
      if (!publicUrl) continue;
      imagesRehosted++;
      content = content.split(src).join(publicUrl);
    }

    // 3) post (idempotent by wpId)
    const publishedAt = new Date(p.date_gmt + "Z");
    await prisma.blogPost.upsert({
      where: { wpId: p.id },
      update: {
        slug: p.slug,
        title,
        excerpt: decodeEntities(p.excerpt.rendered) || null,
        content,
        coverImageUrl,
        coverImageAlt: featured?.alt_text || null,
        status: p.status === "publish" ? "PUBLISHED" : "DRAFT",
        publishedAt,
        authorId: authorId ?? null,
      },
      create: {
        wpId: p.id,
        slug: p.slug,
        title,
        excerpt: decodeEntities(p.excerpt.rendered) || null,
        content,
        coverImageUrl,
        coverImageAlt: featured?.alt_text || null,
        status: p.status === "publish" ? "PUBLISHED" : "DRAFT",
        publishedAt,
        authorId: authorId ?? null,
      },
    });

    // 4) 301 redirect ONLY if the old permalink differs from the new path
    //    (computed above). Crossways already uses /blog/<slug>/, so usually none.
    if (needsRedirect) {
      await prisma.redirect.upsert({
        where: { source: oldPath },
        update: { destination: newPath, statusCode: 301 },
        create: { source: oldPath, destination: newPath, statusCode: 301 },
      });
    }

    migrated++;
  }

  console.log(
    `\n${DRY_RUN ? "Would migrate" : "Migrated"} ${DRY_RUN ? posts.length : migrated} post(s); ` +
      `images seen: ${imagesSeen}${DRY_RUN ? "" : `, rehosted: ${imagesRehosted}`}.`,
  );
  if (DRY_RUN) {
    console.log("\nDry run only — nothing was written. Re-run without --dry-run to apply.");
  }

  await prisma?.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
