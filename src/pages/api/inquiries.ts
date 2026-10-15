import type { APIRoute } from "astro";
import { parseInquiryBody } from "../../lib/inquiries/schema";
import { createSupabaseInsertClient } from "../../lib/supabase/admin";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = parseInquiryBody(json);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createSupabaseInsertClient();
    const { error } = await supabase.from("project_inquiries").insert(parsed.data);

    if (error) {
      console.error("inquiry insert:", error.message);
      return new Response(JSON.stringify({ error: "Could not save your submission." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("inquiry insert env:", err);
    const hint =
      import.meta.env.DEV &&
      err instanceof Error &&
      err.message.includes("Missing Supabase env")
        ? err.message
        : "Server configuration error.";
    return new Response(JSON.stringify({ error: hint }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
