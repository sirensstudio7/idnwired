import { createClient } from "@supabase/supabase-js";
import {
  getNewsItem as getStaticNewsItem,
  getRelatedNews as getStaticRelatedNews,
  newsItems,
  type NewsItem,
} from "../../data/news";
import { decorateArticleHtml, articleBodyToHtml } from "./html";
import { bodyToBlocks, type ArticleRow } from "./schema";

export interface NewsArticle extends NewsItem {
  source: "static" | "database";
  id?: string;
  status?: "draft" | "published";
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  updatedAt?: string | null;
  bodyHtml?: string;
  featuredOnHome?: boolean;
}

function formatDateLabel(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function datetimeDay(iso: string) {
  return iso.slice(0, 10);
}

export function articleRowToNews(row: ArticleRow): NewsArticle {
  const published = row.published_at || row.created_at;
  return {
    source: "database",
    id: row.id,
    status: row.status,
    slug: row.slug,
    category: row.category,
    date: formatShortDate(published),
    dateLabel: formatDateLabel(published),
    datetime: datetimeDay(published),
    title: row.title,
    excerpt: row.excerpt,
    blocks: bodyToBlocks(row.body_markdown),
    bodyHtml: decorateArticleHtml(articleBodyToHtml(row.body_markdown)),
    image: row.cover_image_url,
    imageAlt: row.cover_image_alt,
    href: `/news/${row.slug}`,
    cta: "Read Article",
    author: {
      name: row.author_name,
      role: row.author_role,
      avatar:
        row.author_avatar_url ||
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&q=80",
    },
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    updatedAt: row.updated_at,
    featuredOnHome: Boolean(row.featured_on_home),
  };
}

function withStaticSource(item: NewsItem): NewsArticle {
  return { ...item, source: "static", status: "published", featuredOnHome: true };
}

function publicClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchPublishedArticles(): Promise<NewsArticle[]> {
  const supabase = publicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("articles list:", error?.message);
    return [];
  }

  return (data as ArticleRow[]).map(articleRowToNews);
}

export async function fetchPublishedArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = publicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("article by slug:", error.message);
    return null;
  }

  return data ? articleRowToNews(data as ArticleRow) : null;
}

export async function getPublishedNewsItems(): Promise<NewsArticle[]> {
  const fromDb = await fetchPublishedArticles();
  const used = new Set(fromDb.map((item) => item.slug));
  const fromStatic = newsItems
    .filter((item) => !used.has(item.slug))
    .map(withStaticSource);

  return [...fromDb, ...fromStatic].sort((a, b) => b.datetime.localeCompare(a.datetime));
}

export async function getHomepageNewsItems(): Promise<NewsArticle[]> {
  const supabase = publicClient();
  if (!supabase) return newsItems.map(withStaticSource);

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("featured_on_home", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("homepage articles:", error.message);
    return newsItems.map(withStaticSource);
  }

  if (!data?.length) return [];
  return (data as ArticleRow[]).map(articleRowToNews);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const fromDb = await fetchPublishedArticleBySlug(slug);
  if (fromDb) return fromDb;
  const staticItem = getStaticNewsItem(slug);
  return staticItem ? withStaticSource(staticItem) : null;
}

export async function getRelatedNewsBySlug(slug: string, limit = 3): Promise<NewsArticle[]> {
  const all = await getPublishedNewsItems();
  const related = all.filter((item) => item.slug !== slug).slice(0, limit);
  if (related.length) return related;
  return getStaticRelatedNews(slug, limit).map(withStaticSource);
}
