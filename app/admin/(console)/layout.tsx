import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "./actions";

// Gates the whole console subtree. /admin/login lives OUTSIDE this route group,
// so it is not gated and there is no redirect loop.
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <Link href="/admin/" className="font-semibold">
          Ferndale Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-500">
            {user.email}
            {role === "MASTER" ? (
              <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-xs">
                Master
              </span>
            ) : null}
          </span>
          <form action={signOutAction}>
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
