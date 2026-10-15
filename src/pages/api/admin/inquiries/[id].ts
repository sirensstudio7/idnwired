import type { APIRoute } from "astro";
import { parseStatusUpdate } from "../../../../lib/inquiries/schema";
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

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = parseStatusUpdate(json);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("project_inquiries")
    .update({ status: parsed.status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error("inquiry update:", error.message);
    return new Response(JSON.stringify({ error: "Update failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
