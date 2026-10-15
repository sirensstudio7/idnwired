import type { APIRoute } from "astro";
import { getPublishedNewsItems } from "../lib/news/catalog";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? "https://idnwired.com";
  const items = await getPublishedNewsItems();
  const indexUrl = `  <url>
    <loc>${origin}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  const urls = items
    .map((item) => {
      const loc = `${origin}${item.href}`;
      const lastmod = item.updatedAt || item.datetime;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod.slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexUrl}
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
};
