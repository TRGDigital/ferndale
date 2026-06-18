"use client";

// Holds the managed { src -> alt } map in context so <SiteImage> can resolve
// alt text without each image hitting the DB. The map is fetched server-side
// (getImageAltMap) and passed in once, near the root layout.

import { createContext, useContext } from "react";
import type { AltMap } from "@/lib/data/image-alts";

const AltMapContext = createContext<AltMap>({});

export function AltMapProvider({
  map,
  children,
}: {
  map: AltMap;
  children: React.ReactNode;
}) {
  return (
    <AltMapContext.Provider value={map}>{children}</AltMapContext.Provider>
  );
}

export function useAltMap(): AltMap {
  return useContext(AltMapContext);
}
