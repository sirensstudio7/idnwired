import type { APIRoute } from "astro";
import { assertHomepageHighlightSlot } from "../../../lib/news/highlights";
import { parseArticleInput } from "../../../lib/news/schema";
import { requireAdminUser } from "../../../lib/supabase/server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const { supabase, user } = await requireAdminUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
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

  const parsed = parseArticleInput(json);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slot = await assertHomepageHighlightSlot(supabase, parsed.value);
  if (!slot.ok) {
    return new Response(JSON.stringify({ error: slot.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      ...parsed.value,
      created_by: user.id,
    })
    .select("id, slug, status")
    .single();

  if (error) {
    const duplicate = error.code === "23505" || /duplicate|unique/i.test(error.message);
    console.error("article insert:", error.message);
    return new Response(
      JSON.stringify({
        error: duplicate ? "That slug is already taken." : "Could not save the article.",
      }),
      {
        status: duplicate ? 409 : 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
