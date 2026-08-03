import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client for privileged server-side work (Storage uploads).
// Server-only — never import into a client component.
export function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Gallery uploads reuse the existing public "blog" bucket, under a gallery/ prefix.
export const GALLERY_BUCKET = "blog";
export const GALLERY_PREFIX = "gallery";
