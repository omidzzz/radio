import { z } from "zod";

const text = z.string().trim().min(1).max(20000);
const optionalText = text.optional();
const strings = z.array(text).min(1).max(200);
const localizedText = z.union([text, z.object({ fa: text, en: text })]);

/** No script/data/protocol-relative URLs, control characters, or traversal. */
export function isSafeBlogUrl(value: string): boolean {
  if (/[\s\\\u0000-\u001f\u007f]/u.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) {
    try {
      let decoded = value;
      for (let i = 0; i < 5; i++) {
        const next = decodeURIComponent(decoded);
        if (/[\\\u0000-\u001f\u007f]/u.test(next) || next.startsWith("//") || next.split(/[/?#]/).includes("..")) return false;
        if (next === decoded) return true;
        decoded = next;
      }
      return false;
    } catch { return false; }
  }
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

const safeUrl = text.refine(isSafeBlogUrl, "Use a root-relative path or an http(s) URL");
const faqItem = z.object({ question: text, answer: text }).strict();
const titledItem = z.object({ title: text, text, label: optionalText }).strict();

export const BlogBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.number().int().min(1).max(6), text }).strict(),
  z.object({ type: z.literal("paragraph"), style: z.enum(["default", "lead"]).optional(), text }).strict(),
  z.object({ type: z.literal("list"), style: z.enum(["bullet", "ordered", "numbered"]).default("bullet"), items: strings }).strict(),
  z.object({ type: z.literal("stats"), items: z.array(z.object({ value: text, label: text }).strict()).min(1).max(12) }).strict(),
  z.object({ type: z.literal("image"), src: safeUrl, alt: text, caption: optionalText, width: z.number().int().positive().optional(), height: z.number().int().positive().optional() }).strict(),
  z.object({ type: z.literal("cta"), title: text, text, buttonText: text, buttonUrl: safeUrl }).strict(),
  z.object({ type: z.literal("callout"), tone: z.enum(["info", "success", "warning", "danger"]).default("info"), title: optionalText, text }).strict(),
  z.object({ type: z.literal("quote"), text, attribution: optionalText, sourceUrl: safeUrl.optional() }).strict(),
  z.object({ type: z.literal("table"), caption: text, headers: strings, rows: z.array(strings).min(1).max(200) }).strict().refine((block) => block.rows.every((row) => row.length === block.headers.length), "Every table row must match the number of headers"),
  z.object({ type: z.literal("timeline"), title: optionalText, items: z.array(titledItem).min(1).max(40) }).strict(),
  z.object({ type: z.literal("checklist"), title: optionalText, items: strings }).strict(),
  z.object({ type: z.literal("accordion"), title: optionalText, items: z.array(faqItem).min(1).max(50) }).strict(),
  z.object({ type: z.literal("glossary"), title: optionalText, items: z.array(z.object({ term: text, definition: text }).strict()).min(1).max(100) }).strict(),
  z.object({ type: z.literal("references"), title: optionalText, items: z.array(z.object({ title: text, url: safeUrl, publisher: optionalText }).strict()).min(1).max(100) }).strict(),
  z.object({ type: z.literal("divider") }).strict(),
  z.object({ type: z.literal("code"), language: z.enum(["text", "json", "javascript", "typescript", "bash", "python"]).default("text"), caption: optionalText, code: text }).strict(),
]);

const socialMeta = z.object({ title: optionalText, description: optionalText, image: safeUrl.optional() }).strict();
const TranslationSchema = z.object({
  title: text,
  excerpt: text,
  content: z.array(BlogBlockSchema).min(1).max(600),
  // Accepted for compatibility with exported files; presentation belongs to the template.
  html: z.literal("").optional(),
  css: z.literal("").optional(),
  faq: z.array(faqItem).max(50).default([]),
  seo: z.object({
    title: optionalText,
    metaDescription: optionalText,
    canonical: safeUrl.optional(),
    openGraph: socialMeta.optional(),
    twitter: socialMeta.optional(),
    keywords: z.union([text, z.array(text)]).optional(),
    focusKeyword: optionalText,
  }).strict().optional(),
}).strict();

/** Legacy dates without an offset are interpreted as UTC, never server-local time. */
export function normalizePostDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)) {
    throw new Error("Use YYYY-MM-DD, YYYY-MM-DD HH:mm:ss (UTC), or ISO 8601 with an offset");
  }
  const day = value.slice(0, 10);
  if (value.length > 10) {
    const [hours, minutes, seconds] = value.slice(11, 19).split(":").map(Number);
    if (hours > 23 || minutes > 59 || seconds > 59) throw new Error("Invalid clock time");
  }
  const calendarDate = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== day) throw new Error("Invalid calendar date");
  const iso = value.length === 10 ? `${value}T00:00:00Z` : value.replace(" ", "T");
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(iso) ? iso : `${iso}Z`);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid post date");
  return date.toISOString();
}

export const BlogDocumentSchema = z.object({
  slug: z.string().min(1).max(180).regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Use a lowercase, non-numeric, hyphen-separated slug"),
  title: optionalText,
  date: text.refine((value) => { try { normalizePostDate(value); return true; } catch { return false; } }, "Invalid publication date"),
  updatedAt: text.refine((value) => { try { normalizePostDate(value); return true; } catch { return false; } }, "Invalid update date").optional(),
  tags: z.array(text).max(40).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  kind: z.literal("article").default("article"),
  author: localizedText.optional(),
  category: localizedText.optional(),
  featured: z.boolean().default(false),
  demo: z.boolean().default(false),
  featuredImage: z.object({ src: safeUrl, alt: localizedText }).strict().optional(),
  translations: z.object({ fa: TranslationSchema, en: TranslationSchema }).strict(),
}).strict();

export type BlogBlock = z.infer<typeof BlogBlockSchema>;
export type BlogDocument = z.infer<typeof BlogDocumentSchema>;
export type BlogTranslation = z.infer<typeof TranslationSchema>;

export function parseBlogDocument(input: unknown): BlogDocument {
  return BlogDocumentSchema.parse(input);
}

export function localizeBlogText(value: string | { fa: string; en: string } | undefined, locale: "fa" | "en", fallback = ""): string {
  return typeof value === "string" ? value : value?.[locale] ?? fallback;
}

/** Plain-text projection for FTS, excerpts, reading time, and structured data. */
export function blocksToText(blocks: BlogBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading": case "paragraph": case "quote": case "callout": return block.text;
      case "list": case "checklist": return block.items.join("\n");
      case "stats": return block.items.map((item) => `${item.value} ${item.label}`).join("\n");
      case "image": return [block.alt, block.caption].filter(Boolean).join(" ");
      case "cta": return `${block.title}\n${block.text}\n${block.buttonText}`;
      case "table": return [block.caption, block.headers.join(" "), ...block.rows.map((row) => row.join(" "))].join("\n");
      case "timeline": return block.items.map((item) => `${item.title} ${item.text}`).join("\n");
      case "accordion": return block.items.map((item) => `${item.question} ${item.answer}`).join("\n");
      case "glossary": return block.items.map((item) => `${item.term} ${item.definition}`).join("\n");
      case "references": return block.items.map((item) => item.title).join("\n");
      case "code": return block.code;
      case "divider": return "";
    }
  }).join("\n\n");
}

export function getBlockToc(blocks: BlogBlock[], title: string) {
  return blocks.flatMap((block, index) => {
    if (block.type !== "heading" || (block.level === 1 && block.text === title)) return [];
    const level = Math.max(2, block.level);
    return level === 2 || level === 3 ? [{ id: `block-${index + 1}`, text: block.text, level: level as 2 | 3 }] : [];
  });
}