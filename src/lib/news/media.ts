import sharp from "sharp";

export const ARTICLE_IMAGE_BUCKET = "article-images";

export const ARTICLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const ARTICLE_IMAGE_OUTPUT_TYPE = "image/webp";
export const ARTICLE_IMAGE_OUTPUT_EXT = "webp";

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type ArticleImageKind = "cover" | "author" | "body";

const KIND_PRESETS: Record<
  ArticleImageKind,
  { width: number; height: number; fit: keyof sharp.FitEnum; quality: number }
> = {
  cover: { width: 1600, height: 1600, fit: "inside", quality: 78 },
  body: { width: 1600, height: 2000, fit: "inside", quality: 78 },
  author: { width: 384, height: 384, fit: "cover", quality: 80 },
};

export function isArticleImageKind(value: unknown): value is ArticleImageKind {
  return value === "cover" || value === "author" || value === "body";
}

export function isArticleImageType(type: string): boolean {
  return (ARTICLE_IMAGE_TYPES as readonly string[]).includes(type);
}

export async function compressArticleImage(
  bytes: Uint8Array,
  kind: ArticleImageKind,
): Promise<Buffer> {
  const preset = KIND_PRESETS[kind];
  return sharp(bytes, { failOn: "none" })
    .rotate()
    .resize({
      width: preset.width,
      height: preset.height,
      fit: preset.fit,
      withoutEnlargement: true,
    })
    .webp({
      quality: preset.quality,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();
}
