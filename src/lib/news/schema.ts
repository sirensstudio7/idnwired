import { newsItems, type NewsBlock } from "../../data/news";
import {
  articleBodyToHtml,
  htmlHasHeading,
  htmlToPlainText,
  looksLikeHtml,
  sanitizeArticleHtml,
} from "./html";

export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_CATEGORIES = [
  "Regulation",
  "Business",
  "Tech",
  "People",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleInput {
  status: ArticleStatus;
  slug: string;
  title: string;
  excerpt: string;
  seo_title: string | null;
  seo_description: string | null;
  category: string;
  cover_image_url: string;
  cover_image_alt: string;
  canonical_url: string | null;
  author_name: string;
  author_role: string;
  author_avatar_url: string | null;
  body_markdown: string;
  published_at: string | null;
  featured_on_home: boolean;
}

export interface ArticleRow extends ArticleInput {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const STATIC_SLUGS = new Set(newsItems.map((item) => item.slug));

function trimStr(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function optionalStr(value: unknown, maxLen: number): string | null {
  const s = trimStr(value, maxLen);
  return s.length ? s : null;
}

function parseYesNo(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const s = trimStr(value, 8).toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isReservedSlug(slug: string): boolean {
  return STATIC_SLUGS.has(slug);
}

export function markdownToBlocks(markdown: string): NewsBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: NewsBlock[] = [];
  let para: string[] = [];
  let list: Array<{ lead?: string; text: string }> | null = null;

  const flushPara = () => {
    const text = para.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "p", text });
    para = [];
  };

  const flushList = () => {
    if (list?.length) blocks.push({ type: "ul", items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushPara();
      flushList();
      const text = line.replace(/^#{1,3}\s+/, "").trim();
      if (text) blocks.push({ type: "h2", text });
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushPara();
      flushList();
      blocks.push({
        type: "image",
        alt: image[1].trim() || "Article image",
        src: image[2].trim(),
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!list) list = [];
      const text = line.replace(/^[-*]\s+/, "");
      const lead = text.match(/^\*\*(.+?)\*\*[.:]?\s*(.*)$/);
      if (lead) list.push({ lead: lead[1], text: lead[2] });
      else list.push({ text });
      continue;
    }

    flushList();
    para.push(line);
  }

  flushPara();
  flushList();
  return blocks;
}

function decodeBasic(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function htmlToBlocks(html: string): NewsBlock[] {
  const clean = sanitizeArticleHtml(html);
  const blocks: NewsBlock[] = [];
  const tokenRe =
    /<(h2|h3|p|ul|ol|blockquote|div)(\s[^>]*)?>([\s\S]*?)<\/\1>|<img\b([^>]*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(clean))) {
    if (!match[1]) {
      const attrs = match[4] ?? "";
      const src = attrs.match(/src="([^"]+)"/)?.[1];
      const alt = attrs.match(/alt="([^"]*)"/)?.[1] || "Article image";
      if (src) blocks.push({ type: "image", src, alt });
      continue;
    }

    const tag = match[1].toLowerCase();
    const inner = match[3] ?? "";

    if (tag === "h2" || tag === "h3") {
      const text = htmlToPlainText(inner);
      if (text) blocks.push({ type: "h2", text });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items: Array<{ lead?: string; text: string }> = [];
      for (const item of inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
        const itemHtml = item[1] ?? "";
        const text = htmlToPlainText(itemHtml);
        if (!text) continue;
        const lead = itemHtml.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i);
        if (lead) {
          const leadText = htmlToPlainText(lead[1]);
          const rest = decodeBasic(
            htmlToPlainText(itemHtml.replace(/<strong\b[^>]*>[\s\S]*?<\/strong>/i, "")),
          );
          items.push(leadText ? { lead: leadText, text: rest } : { text });
        } else {
          items.push({ text });
        }
      }
      if (items.length) blocks.push({ type: "ul", items });
      continue;
    }

    const text = htmlToPlainText(inner);
    if (text) blocks.push({ type: "p", text });
  }

  return blocks;
}

export function bodyToBlocks(body: string): NewsBlock[] {
  return looksLikeHtml(body) ? htmlToBlocks(body) : markdownToBlocks(body);
}

export function parseArticleInput(
  json: unknown,
  options: { requirePublishReady?: boolean; allowSlug?: string } = {},
): { ok: true; value: ArticleInput } | { ok: false; error: string } {
  if (!json || typeof json !== "object") {
    return { ok: false, error: "Invalid JSON." };
  }

  const raw = json as Record<string, unknown>;
  const statusRaw = trimStr(raw.status, 16);
  const status = ARTICLE_STATUSES.includes(statusRaw as ArticleStatus)
    ? (statusRaw as ArticleStatus)
    : "draft";
  const requireReady = options.requirePublishReady || status === "published";

  const title = trimStr(raw.title, 180);
  if (title.length < 8) {
    return { ok: false, error: "Title should be at least 8 characters." };
  }

  const slugSource = trimStr(raw.slug, 80) || slugifyTitle(title);
  const slug = slugifyTitle(slugSource);
  if (slug.length < 3 || !SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens." };
  }
  if (isReservedSlug(slug) && slug !== options.allowSlug) {
    return { ok: false, error: "That slug is already used by an existing article." };
  }

  const excerpt = trimStr(raw.excerpt, 220);
  const seo_title = optionalStr(raw.seo_title, 70);
  const seo_description = optionalStr(raw.seo_description, 160);
  const categoryRaw = trimStr(raw.category, 40) || "Business";
  const category = ARTICLE_CATEGORIES.includes(categoryRaw as ArticleCategory)
    ? categoryRaw
    : "Business";
  const cover_image_url = trimStr(raw.cover_image_url, 500);
  const cover_image_alt = trimStr(raw.cover_image_alt, 160);
  const canonical_url = optionalStr(raw.canonical_url, 500);
  const author_name = trimStr(raw.author_name, 80) || "IDNWIRED editorial";
  const author_role = trimStr(raw.author_role, 80) || "Press desk";
  const author_avatar_url = optionalStr(raw.author_avatar_url, 500);
  const body_markdown = articleBodyToHtml(trimStr(raw.body_markdown, 40000));
  const published_at = optionalStr(raw.published_at, 40);
  const featured_on_home = parseYesNo(raw.featured_on_home);

  if (canonical_url && !URL_RE.test(canonical_url)) {
    return { ok: false, error: "Canonical URL must start with http:// or https://." };
  }
  if (cover_image_url && !URL_RE.test(cover_image_url)) {
    return { ok: false, error: "Cover image must be a full http(s) URL." };
  }
  if (author_avatar_url && !URL_RE.test(author_avatar_url)) {
    return { ok: false, error: "Author photo must be a full http(s) URL." };
  }

  if (requireReady) {
    if (excerpt.length < 40) {
      return { ok: false, error: "Meta description / excerpt should be at least 40 characters." };
    }
    if (!cover_image_url || !cover_image_alt) {
      return { ok: false, error: "Published articles need a cover image and alt text." };
    }
    if (htmlToPlainText(body_markdown).length < 80) {
      return { ok: false, error: "Write a longer article body before publishing." };
    }
    if (!htmlHasHeading(body_markdown)) {
      return {
        ok: false,
        error: "Add at least one Heading 2 so the article has a clear heading structure.",
      };
    }
  }

  let publishedIso: string | null = null;
  if (published_at) {
    const parsed = new Date(published_at);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Publish date is invalid." };
    }
    publishedIso = parsed.toISOString();
  } else if (status === "published") {
    publishedIso = new Date().toISOString();
  }

  return {
    ok: true,
    value: {
      status,
      slug,
      title,
      excerpt,
      seo_title,
      seo_description,
      category,
      cover_image_url,
      cover_image_alt,
      canonical_url,
      author_name,
      author_role,
      author_avatar_url,
      body_markdown,
      published_at: publishedIso,
      featured_on_home,
    },
  };
}
