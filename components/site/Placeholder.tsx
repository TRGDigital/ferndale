// Labeled image placeholder. Swap each <ImagePlaceholder label="…" /> for a real
// <SiteImage src="…" /> (or next/image) as photos become available. Renders a
// clean dashed box — never a broken image — and states what photo belongs there.

export function ImagePlaceholder({
  label,
  aspect = "aspect-[4/3]",
  className = "",
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`flex ${aspect} w-full items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-sand/50 ${className}`}
    >
      <div className="px-4 text-center text-muted">
        <svg
          className="mx-auto mb-2 h-8 w-8 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-70">Image to be added</p>
      </div>
    </div>
  );
}
