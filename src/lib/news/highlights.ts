import type { SupabaseClient } from "@supabase/supabase-js";

export const HOMEPAGE_HIGHLIGHT_LIMIT = 6;

export async function countPublishedHighlights(
  supabase: SupabaseClient,
  excludeId?: string,
): Promise<number> {
  let query = supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .eq("featured_on_home", true);

  if (excludeId) query = query.neq("id", excludeId);

  const { count, error } = await query;
  if (error) {
    console.error("highlight count:", error.message);
    return HOMEPAGE_HIGHLIGHT_LIMIT;
  }

  return count ?? 0;
}

export async function assertHomepageHighlightSlot(
  supabase: SupabaseClient,
  input: { featured_on_home: boolean; status: string },
  excludeId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.featured_on_home || input.status !== "published") return { ok: true };

  const used = await countPublishedHighlights(supabase, excludeId);
  if (used >= HOMEPAGE_HIGHLIGHT_LIMIT) {
    return {
      ok: false,
      error: `The landing page only has ${HOMEPAGE_HIGHLIGHT_LIMIT} highlight slots. Turn Highlight off on another published story first.`,
    };
  }

  return { ok: true };
}
