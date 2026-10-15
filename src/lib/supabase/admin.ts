import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let insertClient: SupabaseClient | null = null;

/** Client for inserting inquiries (service role preferred; anon + RLS insert policy as fallback). */
export function createSupabaseInsertClient(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  if (!insertClient) {
    insertClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return insertClient;
}
