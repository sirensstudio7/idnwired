import type { APIRoute } from "astro";
import {
  ARTICLE_IMAGE_BUCKET,
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_OUTPUT_EXT,
  ARTICLE_IMAGE_OUTPUT_TYPE,
  compressArticleImage,
  isArticleImageKind,
  isArticleImageType,
} from "../../../lib/news/media";
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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid upload." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const kindRaw = form.get("kind");
  if (!isArticleImageKind(kindRaw)) {
    return new Response(JSON.stringify({ error: "Unknown image slot." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: "Choose an image to upload." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (file.size > ARTICLE_IMAGE_MAX_BYTES) {
    return new Response(JSON.stringify({ error: "Image must be 5MB or smaller." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isArticleImageType(file.type)) {
    return new Response(JSON.stringify({ error: "Use a JPG, PNG, WebP, GIF, or AVIF file." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const folder = kindRaw === "cover" ? "covers" : kindRaw === "author" ? "authors" : "body";
  const path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ARTICLE_IMAGE_OUTPUT_EXT}`;

  let buffer: Buffer;
  try {
    buffer = await compressArticleImage(new Uint8Array(await file.arrayBuffer()), kindRaw);
  } catch (error) {
    console.error("article image compress:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "Could not compress this image. Try another file." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.storage.from(ARTICLE_IMAGE_BUCKET).upload(path, buffer, {
    contentType: ARTICLE_IMAGE_OUTPUT_TYPE,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    console.error("article image upload:", error.message);
    return new Response(JSON.stringify({ error: "Could not upload the image." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(path);

  return new Response(JSON.stringify({ url: data.publicUrl }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
