// Tiny inline icon set (Lucide-style stroke paths) — no dependency.

const PATHS: Record<string, React.ReactNode> = {
  heart: <path d="M19 14c1.49-1.46 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></>,
  activity: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  bed: <><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20" /><path d="M6 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></>,
  leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />,
  cup: <><path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" /><path d="M16 9h2a2 2 0 0 1 0 4h-2" /><path d="M7 3v2M10 3v2M13 3v2" /></>,
  utensils: <><path d="M5 3v7M8 3v7M5 10a2.5 2.5 0 0 0 5 0M6.5 10v11" /><path d="M18 3c-1.7 0-3 1.8-3 5v3h3m0-8v18" /></>,
  palette: <><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-10z" /><circle cx="8.5" cy="7.5" r=".6" fill="currentColor" /><circle cx="13.5" cy="6.5" r=".6" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".6" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".6" fill="currentColor" /></>,
  film: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" /></>,
  puzzle: <path d="M19.5 14.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H19V8a1 1 0 0 0-1-1h-3.5v-.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V7H9a1 1 0 0 0-1 1v3h-.5C6.67 11 6 11.67 6 12.5S6.67 14 7.5 14H8v3a1 1 0 0 0 1 1h3v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V18h3a1 1 0 0 0 1-1v-2.5z" />,
  scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" /></>,
  music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
  paw: <><circle cx="6.5" cy="11" r="1.6" /><circle cx="10" cy="7.5" r="1.6" /><circle cx="14" cy="7.5" r="1.6" /><circle cx="17.5" cy="11" r="1.6" /><path d="M8.5 16.5c1-2 2.5-3 3.5-3s2.5 1 3.5 3c.8 1.6-.3 3-1.8 3-1 0-1.2-.4-1.7-.4s-.7.4-1.7.4c-1.5 0-2.6-1.4-1.8-3z" /></>,
  church: <path d="M12 2v5M9.5 4.5h5M6 22V10l6-3 6 3v12M10 22v-4a2 2 0 0 1 4 0v4" />,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v9h14v-9" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  accessibility: <><circle cx="12" cy="4" r="1.6" /><path d="M5 8h14M12 8v6M12 14l-3 6M12 14l3 6" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  cookie: <><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" /></>,
};

export function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: keyof typeof PATHS | string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.heart}
    </svg>
  );
}
