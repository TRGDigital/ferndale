import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "./actions";
import { AdminShell } from "@/components/admin/AdminShell";

// Gates the whole console subtree. /admin/login lives OUTSIDE this route group,
// so it is not gated and there is no redirect loop.
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireAdmin();

  return (
    <AdminShell user={user.email ?? "Admin"} role={role} signOut={signOutAction}>
      {children}
    </AdminShell>
  );
}
