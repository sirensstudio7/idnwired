import type { APIRoute } from "astro";
import { parseArticleInput } from "../../../../lib/news/schema";
import { requireAdminUser } from "../../../../lib/supabase/server";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = await requireAdminUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: existing, error: loadError } = await supabase
    .from("articles")
    .select("id, slug")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return new Response(JSON.stringify({ error: "Article not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = parseArticleInput(json, { allowSlug: existing.slug });
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("articles")
    .update(parsed.value)
    .eq("id", id)
    .select("id, slug, status")
    .single();

  if (error) {
    const duplicate = error.code === "23505" || /duplicate|unique/i.test(error.message);
    console.error("article update:", error.message);
    return new Response(
      JSON.stringify({
        error: duplicate ? "That slug is already taken." : "Could not update the article.",
      }),
      {
        status: duplicate ? 409 : 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
