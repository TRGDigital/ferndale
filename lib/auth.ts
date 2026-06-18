// Admin gate. A user is an admin iff they have a valid Supabase session AND
// their email is allowed — either in ADMIN_EMAILS (always MASTER) or in the
// AdminUser table (a login a master created, with its stored role).

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export type AdminRole = "MASTER" | "CLIENT";
export type AdminSession = { user: User; role: AdminRole };

export function envAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The admin role for an email, or null if not an admin. Env admins = MASTER. */
export async function adminRoleFor(
  email: string | undefined | null,
): Promise<AdminRole | null> {
  if (!email) return null;
  const e = email.toLowerCase();
  if (envAdminEmails().includes(e)) return "MASTER";
  const row = await prisma.adminUser
    .findUnique({ where: { email: e } })
    .catch(() => null);
  return row ? (row.role as AdminRole) : null;
}

/** Signed-in admin session (user + role), or null. Never redirects. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = await adminRoleFor(user?.email);
  return user && role ? { user, role } : null;
}

/** Gate for admin pages/actions — redirects to login if not an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");
  return session;
}

/** Gate for master-only actions (user management). */
export async function requireMaster(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");
  if (session.role !== "MASTER") redirect("/admin/");
  return session;
}
