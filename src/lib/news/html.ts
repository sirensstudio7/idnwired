import type { NewsBlock } from "../../data/news";

const VOID_TAGS = new Set(["br", "img"]);
const DROP_WITH_CONTENT = /<\/?(?:script|style|iframe|object|embed|link|meta|svg|math|form|input|button|textarea|select|noscript)[^>]*>/gi;

const ALLOWED_TAGS = new Set([
  "p",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "div",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "br",
  "a",
  "img",
  "span",
]);

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function newsBlocksToHtml(blocks: NewsBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "p") return `<p>${escapeText(block.text)}</p>`;
      if (block.type === "h2") return `<h2>${escapeText(block.text)}</h2>`;
      if (block.type === "image") {
        return `<img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt)}">`;
      }
      const items = block.items
        .map((item) => {
          const lead = item.lead ? `<strong>${escapeText(item.lead)}</strong> ` : "";
          return `<li>${lead}${escapeText(item.text)}</li>`;
        })
        .join("");
      return `<ul>${items}</ul>`;
    })
    .join("");
}

function sanitizeUrl(value: string, protocols: string[]): string | null {
  const trimmed = value.trim().replace(/[\u0000-\u001F\u007F]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (protocols.includes(url.protocol)) return url.href;
  } catch {
    return null;
  }
  return null;
}

function sanitizeCssColor(value: string): string | null {
  const trimmed = value.trim().replace(/[\u0000-\u001F\u007F]/g, "");
  if (!trimmed || /url\s*\(|expression\s*\(|javascript:/i.test(trimmed)) return null;
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return trimmed.toLowerCase();

  const rgb = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i,
  );
  if (rgb) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    if ([r, g, b].some((n) => n > 255)) return null;
    return rgb[4] === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${rgb[4]})`;
  }

  const modern = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})(?:\s*\/\s*(0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i,
  );
  if (modern) {
    const r = Number(modern[1]);
    const g = Number(modern[2]);
    const b = Number(modern[3]);
    if ([r, g, b].some((n) => n > 255)) return null;
    return modern[4] === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${modern[4]})`;
  }

  return null;
}

function extractStyleColor(style: string): string | null {
  const match = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  return match ? sanitizeCssColor(match[1]) : null;
}

function sanitizeAttrs(tag: string, raw: string): string {
  const out: string[] = [];
  let align: string | null = null;
  let color: string | null = null;
  const re = /([a-zA-Z:_][a-zA-Z0-9:_.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name.startsWith("on") || name === "srcset") continue;

    if (tag === "a" && name === "href") {
      const href = sanitizeUrl(value, ["http:", "https:", "mailto:"]);
      if (href) {
        out.push(`href="${escapeAttr(href)}"`);
        out.push('rel="noopener noreferrer"');
        if (href.startsWith("http")) out.push('target="_blank"');
      }
    } else if (tag === "img" && name === "src") {
      const src = sanitizeUrl(value, ["http:", "https:"]);
      if (src) out.push(`src="${escapeAttr(src)}"`);
    } else if (tag === "img" && name === "alt") {
      out.push(`alt="${escapeAttr(value.slice(0, 160))}"`);
    } else if (name === "style") {
      const nextAlign = value.match(/text-align\s*:\s*(left|center|right|justify)/i);
      if (nextAlign) align = nextAlign[1].toLowerCase();
      color = extractStyleColor(value) ?? color;
    } else if (name === "color") {
      color = sanitizeCssColor(value) ?? color;
    }
  }

  const styleParts: string[] = [];
  if (align) styleParts.push(`text-align: ${align}`);
  if (color) styleParts.push(`color: ${color}`);
  if (styleParts.length) out.push(`style="${styleParts.join("; ")}"`);

  if (tag === "img" && !out.some((item) => item.startsWith("src="))) return "";
  if (tag === "a" && !out.some((item) => item.startsWith("href="))) return "";
  return out.length ? ` ${out.join(" ")}` : "";
}

function rewriteTag(name: string): string | null {
  if (name === "h1" || name === "h4" || name === "h5" || name === "h6") return "h2";
  if (name === "b") return "strong";
  if (name === "i") return "em";
  if (name === "strike" || name === "del") return "s";
  if (name === "font") return "span";
  if (ALLOWED_TAGS.has(name)) return name;
  return null;
}

export function sanitizeArticleHtml(input: string): string {
  if (!input) return "";

  const stripped = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(DROP_WITH_CONTENT, "");

  const html = stripped.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, name: string, attrs: string) => {
    const closing = full.startsWith("</");
    const tag = rewriteTag(name.toLowerCase());
    if (!tag) return "";
    if (closing) return `</${tag}>`;
    const cleanAttrs = sanitizeAttrs(tag, attrs);
    if (tag === "img" && !cleanAttrs.includes("src=")) return "";
    if (tag === "a" && !cleanAttrs.includes("href=")) return closing ? "" : "";
    if (VOID_TAGS.has(tag)) return `<${tag}${cleanAttrs}>`;
    return `<${tag}${cleanAttrs}>`;
  });

  return html
    .replace(/<a(\s[^>]*)?>([\s\S]*?)<\/a>/gi, (full, attrs: string, inner: string) => {
      if (!attrs || !/\shref=/.test(attrs)) return inner;
      return full;
    })
    .replace(/(?:<p>\s*(?:<br>\s*)*<\/p>\s*){3,}/gi, "<p><br></p>")
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function htmlToPlainText(html: string): string {
  return decodeEntities(
    sanitizeArticleHtml(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h2|h3|li|blockquote|div)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function htmlHasHeading(html: string): boolean {
  return /<h2\b/i.test(sanitizeArticleHtml(html));
}

const QUESTION_HEADING =
  /^(what|why|how|who|when|where|which|can|do|does|is|are)\b|\?$/i;

export function extractQuestionFaqs(html: string): Array<{ question: string; answer: string }> {
  const clean = sanitizeArticleHtml(html);
  const faqs: Array<{ question: string; answer: string }> = [];
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(clean))) {
    const question = htmlToPlainText(match[1]).trim();
    const answer = htmlToPlainText(match[2]).trim();
    if (!question || answer.length < 40 || !QUESTION_HEADING.test(question)) continue;
    faqs.push({ question, answer: answer.slice(0, 500) });
    if (faqs.length >= 6) break;
  }
  return faqs;
}

function inlineMarkdown(text: string): string {
  const escaped = escapeText(text);
  return escaped
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let ordered = false;

  const flushPara = () => {
    const text = para.join(" ").replace(/\s+/g, " ").trim();
    if (text) html.push(`<p>${inlineMarkdown(text)}</p>`);
    para = [];
  };

  const flushList = () => {
    if (!list?.length) {
      list = null;
      return;
    }
    const tag = ordered ? "ol" : "ul";
    html.push(`<${tag}>${list.map((item) => `<li>${item}</li>`).join("")}</${tag}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushPara();
      flushList();
      const tag = heading[1].length >= 3 ? "h3" : "h2";
      html.push(`<${tag}>${inlineMarkdown(heading[2].trim())}</${tag}>`);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushPara();
      flushList();
      const src = sanitizeUrl(image[2].trim(), ["http:", "https:"]);
      if (src) {
        html.push(`<img src="${escapeAttr(src)}" alt="${escapeAttr(image[1].trim() || "Article image")}">`);
      }
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (list && ordered) flushList();
      if (!list) {
        list = [];
        ordered = false;
      }
      list.push(inlineMarkdown(line.replace(/^[-*]\s+/, "")));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushPara();
      if (list && !ordered) flushList();
      if (!list) {
        list = [];
        ordered = true;
      }
      list.push(inlineMarkdown(line.replace(/^\d+\.\s+/, "")));
      continue;
    }

    flushList();
    para.push(line);
  }

  flushPara();
  flushList();
  return html.join("");
}

export function articleBodyToHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return looksLikeHtml(trimmed) ? sanitizeArticleHtml(trimmed) : markdownToHtml(trimmed);
}

function addClass(html: string, tag: string, className: string): string {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi");
  return html.replace(re, (full, attrs: string = "") => {
    if (/\bclass=/.test(attrs)) {
      return full.replace(/class=(["'])(.*?)\1/i, (_m, quote: string, existing: string) => {
        if (existing.split(/\s+/).includes(className)) {
          return `class=${quote}${existing}${quote}`;
        }
        return `class=${quote}${existing} ${className}${quote}`;
      });
    }
    return `<${tag} class="${className}"${attrs}>`;
  });
}

export function decorateArticleHtml(html: string): string {
  let out = sanitizeArticleHtml(html);
  out = addClass(out, "p", "blog-p");
  out = addClass(out, "div", "blog-p");
  out = addClass(out, "h2", "blog-h2");
  out = addClass(out, "h3", "blog-h3");
  out = addClass(out, "ul", "blog-list");
  out = addClass(out, "ol", "blog-list blog-list--ol");
  out = addClass(out, "blockquote", "blog-quote");
  out = out.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    return `<figure class="blog-figure"><div class="blog-figure__card"><img${attrs} width="1620" height="900" loading="lazy" decoding="async"></div></figure>`;
  });
  return out;
}

export function isEditorHtmlEmpty(html: string): boolean {
  const clean = sanitizeArticleHtml(html);
  if (/<img\b/i.test(clean)) return false;
  return htmlToPlainText(clean).length === 0;
}