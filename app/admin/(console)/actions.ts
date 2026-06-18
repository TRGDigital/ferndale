"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin, requireMaster } from "@/lib/auth";
import { revalidateTags } from "@/lib/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const id = optStr(fd, "id");
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
  if (id) {
    await prisma.sitePage.update({ where: { id }, data });
  } else {
    await prisma.sitePage.create({ data });
  }
  revalidateTags(["site-pages", `page:${path}`, "footer"]);
  redirect("/admin/?tab=pages");
}

export async function deletePage(fd: FormData) {
  await requireAdmin();
  const path = str(fd, "path");
  await prisma.sitePage.delete({ where: { id: str(fd, "id") } });
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
