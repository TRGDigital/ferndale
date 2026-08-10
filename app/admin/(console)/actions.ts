"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin, requireMaster } from "@/lib/auth";
import { revalidateTags } from "@/lib/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateAreaLandingContent } from "@/lib/ai/area-content";
import { townBySlug, careBySlug, titleCaseSlug } from "@/lib/content/local-areas";
import { createServiceClient, GALLERY_BUCKET, GALLERY_PREFIX } from "@/lib/supabase/admin";

// ── helpers ──────────────────────────────────────────────────────────────
function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}
/** Empty -> JSON null (clears the column); otherwise parse (throws if invalid). */
function jsonField(fd: FormData, key: string) {
  const raw = str(fd, key);
  if (!raw) return Prisma.JsonNull;
  return JSON.parse(raw) as Prisma.InputJsonValue;
}
/** Parse one-per-line "Label | /path/" into [{label, href}]; empty -> JSON null. */
function linksField(fd: FormData, key: string) {
  const links = str(fd, key)
    .split("\n")
    .map((line) => {
      const i = line.indexOf("|");
      if (i === -1) return null;
      const label = line.slice(0, i).trim();
      const href = line.slice(i + 1).trim();
      return label && href ? { label, href } : null;
    })
    .filter((l): l is { label: string; href: string } => !!l);
  return links.length ? (links as unknown as Prisma.InputJsonValue) : Prisma.JsonNull;
}

// ── auth ─────────────────────────────────────────────────────────────────
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login/");
}

// ── posts ────────────────────────────────────────────────────────────────
export async function upsertPost(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const slug = str(fd, "slug");
  const status: "PUBLISHED" | "DRAFT" =
    str(fd, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const authorId = optStr(fd, "authorId");
  const tags = str(fd, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Preserve the original publish date across edits; stamp it on first publish.
  let publishedAt: Date | null = null;
  if (status === "PUBLISHED") {
    const existing = id
      ? await prisma.blogPost.findUnique({
          where: { id },
          select: { publishedAt: true },
        })
      : null;
    publishedAt = existing?.publishedAt ?? new Date();
  }

  const data = {
    slug,
    title: str(fd, "title"),
    excerpt: optStr(fd, "excerpt"),
    content: str(fd, "content"),
    coverImageUrl: optStr(fd, "coverImageUrl"),
    coverImageAlt: optStr(fd, "coverImageAlt"),
    status,
    publishedAt,
    seoTitle: optStr(fd, "seoTitle"),
    metaDescription: optStr(fd, "metaDescription"),
    canonicalUrl: optStr(fd, "canonicalUrl"),
    tags,
    faqs: jsonField(fd, "faqs"),
    authorId,
  };

  if (id) {
    await prisma.blogPost.update({ where: { id }, data });
  } else {
    await prisma.blogPost.create({ data });
  }

  revalidateTags(["blog", `blog:${slug}`]);
  redirect("/admin/?tab=posts");
}

export async function deletePost(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const slug = str(fd, "slug");
  await prisma.blogPost.delete({ where: { id } });
  revalidateTags(["blog", `blog:${slug}`]);
  redirect("/admin/?tab=posts");
}

// ── authors ──────────────────────────────────────────────────────────────
export async function upsertAuthor(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const data = {
    slug: str(fd, "slug"),
    name: str(fd, "name"),
    bio: optStr(fd, "bio"),
    avatarUrl: optStr(fd, "avatarUrl"),
    email: optStr(fd, "email"),
  };
  if (id) {
    await prisma.blogAuthor.update({ where: { id }, data });
  } else {
    await prisma.blogAuthor.create({ data });
  }
  revalidateTags(["blog"]);
  redirect("/admin/?tab=authors");
}

export async function deleteAuthor(fd: FormData) {
  await requireAdmin();
  await prisma.blogAuthor.delete({ where: { id: str(fd, "id") } });
  revalidateTags(["blog"]);
  redirect("/admin/?tab=authors");
}

// ── site pages ─────────────────────────────────────────────────────────────
export async function upsertPage(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  const data = {
    path,
    title: str(fd, "title"),
    metaTitle: optStr(fd, "metaTitle"),
    metaDescription: optStr(fd, "metaDescription"),
    canonicalUrl: optStr(fd, "canonicalUrl"),
    ogImageUrl: optStr(fd, "ogImageUrl"),
    faqs: jsonField(fd, "faqs"),
    footer: jsonField(fd, "footer"),
    published: str(fd, "published") === "on",
  };
  // Idempotent by path — works whether or not a row exists yet.
  await prisma.sitePage.upsert({ where: { path }, update: data, create: data });
  revalidateTags(["site-pages", `page:${path}`, "footer"]);
  redirect("/admin/?tab=pages");
}

/** Remove the saved override so the page reverts to its built-in values. */
export async function deletePage(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  await prisma.sitePage.deleteMany({ where: { path } });
  revalidateTags(["site-pages", `page:${path}`, "footer"]);
  redirect("/admin/?tab=pages");
}

// ── image alt tags ─────────────────────────────────────────────────────────
export async function upsertAlt(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const data = { src: str(fd, "src"), alt: str(fd, "alt") };
  if (id) {
    await prisma.siteImageAlt.update({ where: { id }, data });
  } else {
    await prisma.siteImageAlt.create({ data });
  }
  revalidateTags(["image-alts"]);
  redirect("/admin/?tab=alts");
}

export async function deleteAlt(fd: FormData) {
  await requireAdmin();
  await prisma.siteImageAlt.delete({ where: { id: str(fd, "id") } });
  revalidateTags(["image-alts"]);
  redirect("/admin/?tab=alts");
}

/** Save (or clear) the managed alt for a known site image, keyed by src. */
export async function saveImageAlt(fd: FormData) {
  await requireAdmin();
  const src = str(fd, "src");
  const alt = str(fd, "alt");
  if (!src) redirect("/admin/?tab=images");
  if (alt) {
    await prisma.siteImageAlt.upsert({
      where: { src },
      update: { alt },
      create: { src, alt },
    });
  } else {
    // Empty -> remove the override so the code default applies again.
    await prisma.siteImageAlt.deleteMany({ where: { src } });
  }
  revalidateTags(["image-alts"]);
  redirect("/admin/?tab=images");
}

// ── job vacancies ────────────────────────────────────────────────────────────
export async function upsertJob(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const closing = optStr(fd, "closingDate");
  const data = {
    title: str(fd, "title"),
    location: optStr(fd, "location"),
    type: optStr(fd, "type"),
    hours: optStr(fd, "hours"),
    salary: optStr(fd, "salary"),
    summary: optStr(fd, "summary"),
    description: str(fd, "description"),
    published: str(fd, "published") === "on",
    closingDate: closing ? new Date(closing) : null,
    sortOrder: Number.parseInt(str(fd, "sortOrder"), 10) || 0,
  };
  if (id) {
    await prisma.jobPosting.update({ where: { id }, data });
  } else {
    await prisma.jobPosting.create({ data });
  }
  revalidateTags(["jobs"]);
  redirect("/admin/?tab=jobs");
}

export async function deleteJob(fd: FormData) {
  await requireAdmin();
  await prisma.jobPosting.delete({ where: { id: str(fd, "id") } });
  revalidateTags(["jobs"]);
  redirect("/admin/?tab=jobs");
}

// ── legal pages ──────────────────────────────────────────────────────────────
export async function upsertLegal(fd: FormData) {
  await requireAdmin();
  const slug = str(fd, "slug");
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!slug) redirect("/admin/?tab=legal");
  await prisma.legalPage.upsert({
    where: { slug },
    update: { title, content },
    create: { slug, title, content },
  });
  revalidateTags(["legal", `legal:${slug}`, `page:/${slug}/`]);
  redirect("/admin/?tab=legal");
}

/** Remove the DB override so the code default applies again. */
export async function resetLegal(fd: FormData) {
  await requireAdmin();
  const slug = str(fd, "slug");
  await prisma.legalPage.deleteMany({ where: { slug } });
  revalidateTags(["legal", `legal:${slug}`, `page:/${slug}/`]);
  redirect("/admin/?tab=legal");
}

// ── local-area landing pages ─────────────────────────────────────────────────
export async function upsertArea(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  if (!path) redirect("/admin/?tab=areas");
  const offerRaw = str(fd, "offerPoints");
  const offerPoints = offerRaw
    ? offerRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  const data = {
    heading: optStr(fd, "heading"),
    intro: optStr(fd, "intro"),
    body: optStr(fd, "body"),
    areasHeading: optStr(fd, "areasHeading"),
    areasBody: optStr(fd, "areasBody"),
    areasLinks: linksField(fd, "areasLinks"),
    metaTitle: optStr(fd, "metaTitle"),
    metaDescription: optStr(fd, "metaDescription"),
    offerPoints: offerPoints.length
      ? (offerPoints as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    faqs: jsonField(fd, "faqs"),
    notes: optStr(fd, "notes"),
  };
  // A built-in combo override (managed stays false). Use Reset to revert to the code default.
  await prisma.areaPage.upsert({
    where: { path },
    update: data,
    create: { path, ...data },
  });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  redirect(`/admin/?tab=areas&edit=${encodeURIComponent(path)}`);
}

/** Remove the override so the area page reverts to its built-in wording. */
export async function resetArea(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  await prisma.areaPage.deleteMany({ where: { path } });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  redirect("/admin/?tab=areas");
}

/** Admin-only "Page updated" tracker toggle for an area page. Upserts a row so
 *  built-in combos (which may not have a row yet) can be flagged too. Does not
 *  touch page content, so it never changes what the page shows. */
export async function setAreaPageUpdated(path: string, updated: boolean) {
  await requireAdmin();
  if (!path) return;
  await prisma.areaPage.upsert({
    where: { path },
    update: { pageUpdated: updated },
    create: { path, pageUpdated: updated },
  });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
}

// ── Admin-created landing pages (managed = true, a town x service the code lists don't define) ──

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Create a new landing page from a town + service + keyword. Starts as a draft (unpublished). */
export async function createAreaPage(fd: FormData) {
  await requireAdmin();
  const townName = str(fd, "townName");
  const careName = str(fd, "careName");
  if (!townName || !careName) redirect("/admin/?tab=areas&error=missing-town-or-service");
  const townSlug = slugify(townName);
  const careSlug = slugify(careName);
  if (!townSlug || !careSlug) redirect("/admin/?tab=areas&error=bad-slug");
  const path = `/${townSlug}/${careSlug}/`;
  const targetKeyword = optStr(fd, "targetKeyword");
  const careNoun = careName.toLowerCase();

  const existing = await prisma.areaPage.findUnique({ where: { path } });
  if (existing) {
    // Promote an existing override into a managed page rather than duplicating the path.
    await prisma.areaPage.update({
      where: { path },
      data: { managed: true, townSlug, townName, careSlug, careName, careNoun, targetKeyword },
    });
  } else {
    await prisma.areaPage.create({
      data: {
        path,
        managed: true,
        published: false,
        townSlug,
        townName,
        careSlug,
        careName,
        careNoun,
        targetKeyword,
      },
    });
  }
  revalidateTags(["area-pages", `area:${path}`]);
  redirect(`/admin/?tab=areas&edit=${encodeURIComponent(path)}`);
}

/** Full content update for a managed landing page. */
export async function updateAreaPage(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  if (!path) redirect("/admin/?tab=areas");
  const offerRaw = str(fd, "offerPoints");
  const offerPoints = offerRaw
    ? offerRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  await prisma.areaPage.update({
    where: { path },
    data: {
      careName: optStr(fd, "careName"),
      careNoun: optStr(fd, "careNoun"),
      targetKeyword: optStr(fd, "targetKeyword"),
      metaTitle: optStr(fd, "metaTitle"),
      metaDescription: optStr(fd, "metaDescription"),
      heading: optStr(fd, "heading"),
      intro: optStr(fd, "intro"),
      body: optStr(fd, "body"),
      areasHeading: optStr(fd, "areasHeading"),
      areasBody: optStr(fd, "areasBody"),
      areasLinks: linksField(fd, "areasLinks"),
      offerPoints: offerPoints.length
        ? (offerPoints as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      faqs: jsonField(fd, "faqs"),
      notes: optStr(fd, "notes"),
    },
  });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  redirect(`/admin/?tab=areas&edit=${encodeURIComponent(path)}`);
}

/** Publish / unpublish a managed landing page. */
export async function setAreaPublished(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  const published = str(fd, "published") === "true";
  await prisma.areaPage.update({ where: { path }, data: { published } });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  redirect(`/admin/?tab=areas&edit=${encodeURIComponent(path)}`);
}

/** Delete a managed landing page. */
export async function deleteAreaPage(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  await prisma.areaPage.deleteMany({ where: { path, managed: true } });
  revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  redirect("/admin/?tab=areas");
}

/** Generate all page content from the target keyword with AI, then save it (editable after). */
export async function generateAreaContent(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  if (!path) redirect("/admin/?tab=areas");
  const row = await prisma.areaPage.findUnique({ where: { path } });

  // Works for admin-created pages AND built-in combos: derive town/service from the row, else
  // from the path via the code lists.
  const m = path.match(/^\/([^/]+)\/([^/]+)\/$/);
  const townSlug = m?.[1] ?? "";
  const careSlug = m?.[2] ?? "";
  const codeTown = townBySlug(townSlug);
  const codeCare = careBySlug(careSlug);
  const townName = row?.townName ?? codeTown?.name ?? titleCaseSlug(townSlug);
  const careName = row?.careName ?? codeCare?.name ?? titleCaseSlug(careSlug);
  if (!townName || !careName) redirect("/admin/?tab=areas");
  const keyword =
    optStr(fd, "targetKeyword") ?? row?.targetKeyword ?? `${careName} in ${townName}`;

  // redirect() must stay OUT of the try/catch (Next throws NEXT_REDIRECT internally).
  let error = "";
  try {
    const c = await generateAreaLandingContent({ townName, careName, keyword });
    const content = {
      targetKeyword: keyword,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      heading: c.heading,
      intro: c.intro,
      body: c.body,
      offerPoints: c.offerPoints as unknown as Prisma.InputJsonValue,
      faqs: c.faqs as unknown as Prisma.InputJsonValue,
    };
    // update leaves managed/published untouched (managed pages keep their draft state); create makes
    // a built-in override (managed = false, published so it shows immediately).
    await prisma.areaPage.upsert({
      where: { path },
      update: content,
      create: {
        path,
        managed: false,
        published: true,
        townSlug,
        townName,
        careSlug,
        careName,
        careNoun: careName.toLowerCase(),
        ...content,
      },
    });
    revalidateTags(["area-pages", `area:${path}`, `page:${path}`]);
  } catch (e) {
    error = e instanceof Error ? e.message : "AI generation failed";
  }
  const base = `/admin/?tab=areas&edit=${encodeURIComponent(path)}`;
  redirect(error ? `${base}&error=${encodeURIComponent(error)}` : base);
}

// ── Site settings (editable key/value) ─────────────────────────────────────

/** Upsert a single editable site setting (e.g. the read-aloud welcome). */
export async function upsertSetting(fd: FormData) {
  await requireAdmin();
  const key = str(fd, "key");
  if (!key) redirect("/admin/?tab=home");
  const value = str(fd, "value").slice(0, 4000);
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidateTags(["settings"]);
  redirect("/admin/?tab=home");
}

/** Upload the site social-share image to public Storage; returns its URL or null. */
async function uploadSocialImage(file: File | null): Promise<string | null> {
  if (!file || typeof file !== "object" || file.size === 0) return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const ext = (file.type.split("/").pop() || "jpg").replace(/[^a-z0-9]/g, "");
  const path = `site/social/og-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, key);
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage
    .from("blog")
    .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) return null;
  return `${url}/storage/v1/object/public/blog/${path}`;
}

/** Set the site-wide social share image (og:image): upload a file or paste a URL. */
export async function saveSocialImage(fd: FormData) {
  await requireAdmin();
  const uploaded = await uploadSocialImage(fd.get("file") as File | null);
  // An uploaded file wins; otherwise use a pasted URL (blank clears it).
  const value = uploaded ?? str(fd, "url");
  await prisma.siteSetting.upsert({
    where: { key: "og_image" },
    update: { value },
    create: { key: "og_image", value },
  });
  revalidateTags(["settings"]);
  revalidatePath("/", "layout"); // refresh og:image across the whole site
  redirect("/admin/?tab=seo");
}

// ── Care team (add / edit / remove) ────────────────────────────────────────

/** Upload a staff photo to public Storage and return its URL (or null). */
async function uploadTeamPhoto(
  file: File | null,
  name: string,
): Promise<string | null> {
  if (!file || typeof file !== "object" || file.size === 0) return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "member";
  const ext = (file.type.split("/").pop() || "jpg").replace(/[^a-z0-9]/g, "");
  const path = `site/team/${slug}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, key);
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage
    .from("blog")
    .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) return null;
  return `${url}/storage/v1/object/public/blog/${path}`;
}

/** Add a new team member or update an existing one (with optional new photo). */
export async function upsertTeamMember(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const name = str(fd, "name");
  const role = str(fd, "role");
  if (!name || !role) redirect("/admin/?tab=home");
  const bio = optStr(fd, "bio");
  const sortOrder = Number.parseInt(str(fd, "sortOrder"), 10);
  const order = Number.isFinite(sortOrder) ? sortOrder : 50;
  const photoUrl = await uploadTeamPhoto(fd.get("photo") as File | null, name);

  if (id) {
    await prisma.teamMember.update({
      where: { id },
      data: { name, role, bio, sortOrder: order, ...(photoUrl ? { photoUrl } : {}) },
    });
  } else {
    await prisma.teamMember.create({
      data: { name, role, bio, sortOrder: order, photoUrl },
    });
  }
  revalidateTags(["team"]);
  redirect("/admin/?tab=home");
}

/** Remove a team member. */
export async function deleteTeamMember(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await prisma.teamMember.delete({ where: { id } }).catch(() => {});
  revalidateTags(["team"]);
  redirect("/admin/?tab=home");
}

// ── leads / CRM ────────────────────────────────────────────────────────────
export async function updateLeadStatus(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  const valid = ["NEW", "CONTACTED", "CLOSED"].includes(status)
    ? (status as "NEW" | "CONTACTED" | "CLOSED")
    : "NEW";
  await prisma.lead.update({ where: { id: str(fd, "id") }, data: { status: valid } });
  redirect("/admin/?tab=leads");
}

export async function deleteLead(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const lead = await prisma.lead.findUnique({ where: { id } });
  const cvPath = (lead?.meta as { cvPath?: string | null } | null)?.cvPath;
  // Remove the CV file from private storage too, if present.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (cvPath && url && key) {
    const { createClient } = await import("@supabase/supabase-js");
    await createClient(url, key).storage.from("applications").remove([cvPath]).catch(() => {});
  }
  await prisma.lead.delete({ where: { id } });
  redirect("/admin/?tab=leads");
}

// Re-fire the lead-notification webhook for an existing lead — used to deliver a
// notification that failed the first time (e.g. while the email account was
// suspended). Same payload the public lead route sends.
export async function resendLead(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const lead = await prisma.lead.findUnique({ where: { id } });
  const webhook = process.env.LEAD_WEBHOOK_URL;
  // Report the real outcome (don't silently claim success) so a failed
  // notification is visible per lead.
  let sent: "1" | "err" | "nowebhook" = "err";
  if (!webhook) {
    sent = "nowebhook";
  } else if (lead) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lead, createdAt: lead.createdAt, resent: true }),
      });
      sent = res.ok ? "1" : "err";
    } catch {
      sent = "err";
    }
  }
  redirect(`/admin/?tab=leads&sent=${sent}`);
}

// ── admin users (master only) ────────────────────────────────────────────────

export async function createAdminUser(fd: FormData) {
  await requireMaster();
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const role = str(fd, "role") === "MASTER" ? "MASTER" : "CLIENT";

  if (!email || password.length < 8) {
    redirect("/admin/?tab=users&error=" + encodeURIComponent("Email and a password of at least 8 characters are required."));
  }

  // Create the Supabase Auth login (confirmed so they can sign in immediately).
  let supabaseUserId: string | null = null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error && !/already.*registered|exists/i.test(error.message)) {
      redirect("/admin/?tab=users&error=" + encodeURIComponent(error.message));
    }
    supabaseUserId = data?.user?.id ?? null;
  }

  // Grant admin access (idempotent).
  await prisma.adminUser.upsert({
    where: { email },
    update: { role, supabaseUserId: supabaseUserId ?? undefined },
    create: { email, role, supabaseUserId },
  });

  redirect("/admin/?tab=users");
}

export async function deleteAdminUser(fd: FormData) {
  await requireMaster();
  const id = str(fd, "id");
  const row = await prisma.adminUser.findUnique({ where: { id } });

  // Remove the Supabase Auth login too, if we created one.
  if (row?.supabaseUserId) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await sb.auth.admin.deleteUser(row.supabaseUserId).catch(() => {});
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  redirect("/admin/?tab=users");
}

// ── Gallery (Our Home) ─────────────────────────────────────────────────────

const galleryErr = (msg: string) =>
  redirect(`/admin/?tab=gallery&error=${encodeURIComponent(msg)}`);

export async function uploadGalleryImage(fd: FormData) {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) galleryErr("Please choose an image to upload.");
  const f = file as File;
  if (!f.type.startsWith("image/")) galleryErr("That file is not an image.");

  const supabase = createServiceClient();
  const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${GALLERY_PREFIX}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await f.arrayBuffer());
  const { error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, bytes, { contentType: f.type, upsert: false });
  if (error) galleryErr(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  const max = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } });
  await prisma.galleryImage.create({
    data: {
      url: data.publicUrl,
      alt: str(fd, "alt"),
      caption: optStr(fd, "caption"),
      sortOrder: (max._max.sortOrder ?? 0) + 10,
    },
  });
  revalidateTags(["gallery"]);
  revalidatePath("/our-home/");
  redirect("/admin/?tab=gallery");
}

export async function updateGalleryImage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) redirect("/admin/?tab=gallery");
  await prisma.galleryImage.update({
    where: { id },
    data: {
      alt: str(fd, "alt"),
      caption: optStr(fd, "caption"),
      sortOrder: Number.parseInt(str(fd, "sortOrder"), 10) || 0,
    },
  });
  revalidateTags(["gallery"]);
  revalidatePath("/our-home/");
  redirect("/admin/?tab=gallery");
}

export async function deleteGalleryImage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const row = await prisma.galleryImage.findUnique({ where: { id } });
  if (row) {
    // Only remove the storage object for images WE uploaded (gallery/ prefix) — never the
    // shared site photos that the gallery may also reference.
    try {
      const marker = `/object/public/${GALLERY_BUCKET}/`;
      const at = row.url.indexOf(marker);
      if (at !== -1) {
        const path = row.url.slice(at + marker.length);
        if (path.startsWith(`${GALLERY_PREFIX}/`)) {
          await createServiceClient().storage.from(GALLERY_BUCKET).remove([path]);
        }
      }
    } catch {
      /* ignore storage cleanup errors — the DB row is what matters */
    }
    await prisma.galleryImage.delete({ where: { id } });
  }
  revalidateTags(["gallery"]);
  revalidatePath("/our-home/");
  redirect("/admin/?tab=gallery");
}

// ── Reviews (carehome.co.uk, curated) ──────────────────────────────────────

export async function upsertReview(fd: FormData) {
  await requireAdmin();
  const id = optStr(fd, "id");
  const dateRaw = str(fd, "reviewDate");
  const data = {
    author: str(fd, "author"),
    relationship: optStr(fd, "relationship"),
    rating: Math.min(5, Math.max(1, Number.parseInt(str(fd, "rating"), 10) || 5)),
    title: optStr(fd, "title"),
    body: str(fd, "body"),
    reviewDate: dateRaw ? new Date(dateRaw) : null,
    featured: str(fd, "featured") === "on",
    sortOrder: Number.parseInt(str(fd, "sortOrder"), 10) || 0,
  };
  if (id) {
    await prisma.review.update({ where: { id }, data });
  } else {
    await prisma.review.create({ data });
  }
  revalidateTags(["reviews"]);
  revalidatePath("/reviews/");
  revalidatePath("/");
  redirect("/admin/?tab=reviews");
}

export async function deleteReview(fd: FormData) {
  await requireAdmin();
  await prisma.review.delete({ where: { id: str(fd, "id") } });
  revalidateTags(["reviews"]);
  revalidatePath("/reviews/");
  revalidatePath("/");
  redirect("/admin/?tab=reviews");
}

export async function saveReviewsUrl(fd: FormData) {
  await requireAdmin();
  const value = str(fd, "reviewsUrl");
  const sources = str(fd, "reviewSources");
  await prisma.siteSetting.upsert({
    where: { key: "reviews_url" },
    update: { value },
    create: { key: "reviews_url", value },
  });
  await prisma.siteSetting.upsert({
    where: { key: "review_sources" },
    update: { value: sources },
    create: { key: "review_sources", value: sources },
  });
  revalidateTags(["settings"]);
  revalidatePath("/reviews/");
  redirect("/admin/?tab=reviews");
}
