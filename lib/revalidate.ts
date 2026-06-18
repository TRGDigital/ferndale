// Shared revalidation used by admin Server Actions (read-your-own-writes).
//
// updateTag() gives the saver an immediate, consistent view (Next 16). It can
// ONLY be called from a Server Action — which is exactly where admin writes
// happen. The /api/revalidate route stays for external/programmatic callers.

import { updateTag } from "next/cache";

export function revalidateTags(tags: string[]) {
  for (const tag of tags) updateTag(tag);
}
