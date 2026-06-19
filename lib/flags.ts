// Build-time feature flags + image-placeholder detection.

// Master override: force EVERY photo/logo to render as a placeholder. Leave
// false and rely on per-image detection below (so images flip to real as soon
// as they're repointed to Ferndale's own storage).
export const SHOW_IMAGE_PLACEHOLDERS = false;

// An image is treated as "not provided yet" (render a labelled placeholder)
// while it still points at the Crossways assets the clone was copied from.
// Repoint a src to Ferndale's own Supabase bucket (or a Ferndale local asset)
// and it renders for real automatically — no flag flip needed.
export function isPlaceholderImage(src?: string | null): boolean {
  if (!src) return true;
  return (
    src.includes("trmwjilicdxgrzbwzchf") || // Crossways Supabase bucket
    src.includes("/images/crossways") || // Crossways local logo
    src.includes("silhouette") // generic silhouette stand-in
  );
}
