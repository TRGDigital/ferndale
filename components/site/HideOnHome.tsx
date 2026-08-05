"use client";

import { usePathname } from "next/navigation";

// Renders its children on every page EXCEPT the homepage. usePathname resolves
// during SSR too, so the wrapped content is still server-rendered (and crawlable)
// on inner pages, while the homepage keeps only its in-hero availability badge.
export function HideOnHome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
