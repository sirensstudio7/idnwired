import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const ORIGIN = "https://www.prnewswire.com";
const LIST_URL = `${ORIGIN}/id/rilis-berita/news-releases-list/`;
const LIMIT = 20;
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "exports");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

async function fetchHtml(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function decodeCfEmail(encoded) {
  if (!encoded || encoded.length < 4) return "";
  const key = parseInt(encoded.slice(0, 2), 16);
  let email = "";
  for (let i = 2; i < encoded.length; i += 2) {
    email += String.fromCharCode(parseInt(encoded.slice(i, i + 2), 16) ^ key);
  }
  return email;
}

function prepareParagraphClone($, el) {
  const clone = $(el).clone();
  clone.find("script, style").remove();
  clone.find("[data-cfemail]").each((_, node) => {
    const email = decodeCfEmail($(node).attr("data-cfemail"));
    $(node).replaceWith(email);
  });
  clone.find("a[href^='mailto:']").each((_, a) => {
    const email = $(a).attr("href")?.replace(/^mailto:/i, "") ?? $(a).text();
    $(a).replaceWith(email);
  });
  clone.find("br").replaceWith("\n");
  return clone;
}

function paragraphText($, el) {
  return prepareParagraphClone($, el)
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphLines($, el) {
  return prepareParagraphClone($, el)
    .text()
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const MEDIA_HEADER =
  /^(Narahubung Media|Kontak Media|Media Contacts?|Kontak Pers)\s*:?\s*/i;
const INVESTOR_HEADER = /^Narahubung Investor\s*/i;

function findContactParagraphEl($, kind) {
  const patterns =
    kind === "media"
      ? [/Narahubung Media/i, /Media Contact/i, /Media Contacts/i, /Kontak Media/i, /Kontak Pers/i]
      : [/Narahubung Investor/i, /Investor Contact/i, /Investor Relations/i, /Kontak Investor/i];

  const candidates = $(".release-body p, section.release-body p").toArray();
  for (const el of candidates) {
    const text = paragraphText($, el);
    if (patterns.some((re) => re.test(text))) return el;
  }
  return null;
}

const EMAIL_RE = /[A-Za-z][\w.+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE =
  /(\+\d[\d\s().-]{6,}|\(\d{2,4}\)\s*\d[\d\s.-]{5,}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4,}|\d{2,4}[-.\s]\d{3}[-.\s]\d{4,})/;

function cleanMediaLines($, el) {
  return paragraphLines($, el)
    .map((line) => line.replace(MEDIA_HEADER, "").trim())
    .filter(
      (line) =>
        line &&
        !/^Kontak Media\s*:?\s*$/i.test(line) &&
        !/^Narahubung Media$/i.test(line),
    );
}

function groupMediaBlocks(lines) {
  const blocks = [];
  let parts = [];

  const flush = () => {
    if (parts.length) blocks.push(parts);
    parts = [];
  };

  for (const line of lines) {
    const hasEmail = EMAIL_RE.test(line);
    const hasPhone = PHONE_RE.test(line);
    const isSingleLineContact = hasEmail && hasPhone && line.includes(",");

    if (isSingleLineContact) {
      flush();
      blocks.push([line]);
      continue;
    }

    parts.push(line);
    if (hasEmail) flush();
  }

  flush();
  return blocks;
}

function parseMediaBlock(parts) {
  if (parts.length === 1) return parseMediaLine(parts[0]);

  const email =
    parts.map((p) => p.match(EMAIL_RE)?.[0]).find(Boolean) ?? "";
  const phone =
    parts
      .map((p) => (EMAIL_RE.test(p) ? "" : p.match(PHONE_RE)?.[0]?.trim()))
      .find(Boolean) ?? "";
  const textParts = parts.filter((p) => {
    if (email && p.includes(email)) return false;
    if (phone && p.includes(phone) && p.replace(phone, "").trim().length < 4) return false;
    return true;
  });

  return {
    name: textParts[0]?.replace(/,\s*$/, "").trim() ?? "",
    region: textParts.slice(1).join(", ").replace(/,\s*$/, "").trim(),
    phone,
    email,
  };
}

function parseMediaLine(line) {
  let rest = line.replace(MEDIA_HEADER, "").trim();
  if (!rest || /^Narahubung Media$/i.test(rest)) return null;

  const email = rest.match(EMAIL_RE)?.[0] ?? "";
  if (email) rest = rest.replace(email, "").replace(/,\s*$/, "").trim();

  const phoneMatch = rest.match(PHONE_RE);
  const phone = phoneMatch?.[0]?.trim() ?? "";
  if (phone) {
    const idx = rest.indexOf(phone);
    rest = rest.slice(0, idx).replace(/,\s*$/, "").trim();
  }

  rest = rest.replace(/,\s*$/, "").trim();
  const commaParts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  let name = rest;
  let region = "";
  if (commaParts.length >= 2) {
    name = commaParts[0];
    region = commaParts.slice(1).join(", ");
  }

  return { name, region, phone, email };
}

function parseMediaContacts($, el) {
  if (!el) return [];
  const lines = cleanMediaLines($, el);
  return groupMediaBlocks(lines)
    .map((parts) => parseMediaBlock(parts))
    .filter((c) => c && (c.name || c.email || c.phone));
}

function parseInvestorContact($, el) {
  if (!el) return null;
  const text = paragraphText($, el);
  if (!text) return null;

  let body = text.replace(INVESTOR_HEADER, "").trim();
  const email =
    body.match(/(?:Surel|Email|E-mail)\s*:\s*(\S+@\S+)/i)?.[1] ??
    body.match(EMAIL_RE)?.[0] ??
    "";
  const tel = body.match(/Tel(?:efon)?\s*:\s*(.+?)(?=Faks|Fax|Surel|Email|E-mail|$)/i)?.[1]?.trim() ?? "";
  const fax = body.match(/Faks(?:imile)?\s*:\s*(.+?)(?=Surel|Email|E-mail|Tel|$)/i)?.[1]?.trim() ?? "";

  body = body
    .replace(/Tel(?:efon)?\s*:.+?(?=Faks|Fax|Surel|Email|$)/i, "")
    .replace(/Faks(?:imile)?\s*:.+?(?=Surel|Email|Tel|$)/i, "")
    .replace(/(?:Surel|Email|E-mail)\s*:\s*\S+/i, "")
    .trim();

  const org = body.replace(/\s+/g, " ").trim();
  return { organization: org, tel, fax, email };
}

function articleToSheetRows(article) {
  const base = { Title: article.title, URL: article.url, Error: article.error ?? "" };
  const rows = [];

  for (const c of article.media) {
    rows.push({
      ...base,
      Type: "Media",
      Name: c.name,
      Region: c.region,
      Phone: c.phone,
      Email: c.email,
      Organization: "",
      Tel: "",
      Fax: "",
    });
  }

  if (article.investor) {
    rows.push({
      ...base,
      Type: "Investor",
      Name: "",
      Region: "",
      Phone: "",
      Email: article.investor.email,
      Organization: article.investor.organization,
      Tel: article.investor.tel,
      Fax: article.investor.fax,
    });
  }

  if (rows.length === 0) {
    rows.push({
      ...base,
      Type: "",
      Name: "",
      Region: "",
      Phone: "",
      Email: "",
      Organization: "",
      Tel: "",
      Fax: "",
    });
  }

  return rows;
}

function toAbsoluteUrl(href) {
  if (!href) return "";
  return new URL(href, ORIGIN).href;
}

async function getListingUrls(html) {
  const $ = cheerio.load(html);
  return [
    ...new Set(
      $("a.newsreleaseconsolidatelink")
        .map((_, a) => toAbsoluteUrl($(a).attr("href")))
        .get()
        .filter(Boolean),
    ),
  ].slice(0, LIMIT);
}

async function scrapeArticle(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  const mediaEl = findContactParagraphEl($, "media");
  const investorEl = findContactParagraphEl($, "investor");

  return {
    title,
    url,
    media: parseMediaContacts($, mediaEl),
    investor: parseInvestorContact($, investorEl),
  };
}

async function main() {
  console.log("Fetching listing…");
  const listingHtml = await fetchHtml(LIST_URL);
  const urls = await getListingUrls(listingHtml);
  console.log(`Found ${urls.length} release URLs`);

  const rows = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] ${url}\n`);
    try {
      rows.push(await scrapeArticle(url));
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      rows.push({
        title: "",
        url,
        media: [],
        investor: null,
        error: String(err),
      });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sheetRows = rows.flatMap(articleToSheetRows);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetRows);
  ws["!cols"] = [
    { wch: 55 },
    { wch: 75 },
    { wch: 10 },
    { wch: 28 },
    { wch: 35 },
    { wch: 22 },
    { wch: 32 },
    { wch: 45 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");

  const xlsPath = path.join(OUT_DIR, "prnewswire-contacts.xls");
  const xlsxPath = path.join(OUT_DIR, "prnewswire-contacts.xlsx");
  XLSX.writeFile(wb, xlsPath, { bookType: "biff8" });
  XLSX.writeFile(wb, xlsxPath);

  console.log(`Wrote ${xlsPath}`);
  console.log(`Wrote ${xlsxPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
