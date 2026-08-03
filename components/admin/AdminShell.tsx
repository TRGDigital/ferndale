"use client";

// The CRM shell: a dark branded sidebar (grouped nav with icons), a top bar with the
// signed-in user, and the content area. Responsive — the sidebar becomes a slide-over on mobile.

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminNav } from "@/lib/admin-nav";

function NavIcon({ name, className = "h-[18px] w-[18px]" }: { name: string; className?: string }) {
  const p: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    inbox: (
      <>
        <path d="M3.75 13 6 5.5h12L20.25 13v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M3.75 13h4l1.5 2.25h5.5L16.25 13h4" />
      </>
    ),
    post: (
      <>
        <path d="M6 3.75h7.5L18 8.25v11.25a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V4.5A.75.75 0 0 1 6 3.75z" />
        <path d="M13 3.75V8.5h4.75M8 12.5h6M8 15.5h6" />
      </>
    ),
    page: (
      <>
        <path d="M6 3.75h7.5L18 8.25v11.25a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V4.5A.75.75 0 0 1 6 3.75z" />
        <path d="M13 3.75V8.5h4.75" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.25 6-10.5A6 6 0 0 0 6 10.5C6 15.75 12 21 12 21z" />
        <circle cx="12" cy="10.5" r="2.25" />
      </>
    ),
    image: (
      <>
        <rect x="3.75" y="5.25" width="16.5" height="13.5" rx="1.5" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m4.5 17 4.5-4 3 2.5 3-3 4.75 4.5" />
      </>
    ),
    star: <path d="m12 4 2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 16.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3.75" y="7.5" width="16.5" height="11.75" rx="1.5" />
        <path d="M8.25 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5v1.5M3.75 12.5h16.5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="m20 20-5.2-5.2" />
      </>
    ),
    shield: <path d="M12 3.75 5.25 6v5.25c0 4.5 3 7.5 6.75 9 3.75-1.5 6.75-4.5 6.75-9V6z" />,
    users: (
      <>
        <circle cx="9" cy="8.5" r="3" />
        <path d="M3.75 19a5.25 5.25 0 0 1 10.5 0M15.5 6.2a3 3 0 0 1 0 5.6M20.25 19a5.25 5.25 0 0 0-3.5-4.95" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {p[name] ?? p.page}
    </svg>
  );
}

export function AdminShell({
  user,
  role,
  signOut,
  children,
}: {
  user: string;
  role: string;
  signOut: () => void;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const active = params.get("tab") ?? "home";
  const [open, setOpen] = useState(false);

  const groups = adminNav
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.master || role === "MASTER") }))
    .filter((g) => g.items.length);

  const nav = (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-100/50">
            {g.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const on = active === it.key;
              return (
                <Link
                  key={it.key}
                  href={`/admin/?tab=${it.key}`}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    on
                      ? "bg-white/12 font-medium text-white"
                      : "text-brand-100/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={on ? "text-white" : "text-brand-100/60 group-hover:text-white"}>
                    <NavIcon name={it.icon} />
                  </span>
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const brand = (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-serif text-lg font-semibold text-white">
        C
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">Ferndale</span>
        <span className="block text-[11px] text-brand-100/60">Content console</span>
      </span>
    </div>
  );

  const footer = (
    <a
      href="https://trgdigital.co.uk"
      target="_blank"
      rel="noopener"
      className="shrink-0 border-t border-white/10 px-5 py-4 transition-colors hover:bg-white/5"
    >
      <span className="block text-[11px] text-brand-100/50">Designed &amp; built by</span>
      <span className="text-sm font-medium text-white">TRG Digital</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-brand-700 lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile slide-over */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-brand-700 shadow-2xl">
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-ink lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-flex"
            >
              View live site
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
            <div className="hidden items-center gap-2 border-l border-neutral-200 pl-4 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {user.slice(0, 1).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block max-w-[160px] truncate text-sm font-medium text-ink">{user}</span>
                <span className="block text-[11px] text-muted">
                  {role === "MASTER" ? "Master admin" : "Editor"}
                </span>
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-neutral-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
