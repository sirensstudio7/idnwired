import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

export function createSupabaseServerClient(cookies: AstroCookies) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookies.delete(name, options);
      },
    },
  });
}

export async function requireAdminUser(cookies: AstroCookies) {
  const supabase = createSupabaseServerClient(cookies);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null as null };
  }

  return { supabase, user };
}
