import type Database from "better-sqlite3";
import { blocksToText, localizeBlogText, normalizePostDate, parseBlogDocument, type BlogDocument } from "./schema.ts";

/** Shared by the application migration and the standalone importer. */
export function ensureBlogDocumentColumns(db: Database.Database): void {
  const columns = new Set((db.prepare("PRAGMA table_info(blog_posts)").all() as { name: string }[]).map((column) => column.name));
  if (!columns.size) throw new Error("blog_posts is missing; initialize the application database first");
  if (!columns.has("slug")) db.exec("ALTER TABLE blog_posts ADD COLUMN slug TEXT");
  if (!columns.has("document_json")) db.exec("ALTER TABLE blog_posts ADD COLUMN document_json TEXT");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug) WHERE slug IS NOT NULL");
}

/** Idempotent upsert: preserves numeric ids, comments, views, and creation time. */
export function importBlogDocument(db: Database.Database, input: unknown): { id: number; slug: string; created: boolean } {
  const document = parseBlogDocument(input);
  return db.transaction(() => {
    ensureBlogDocumentColumns(db);
    const previous = db.prepare("SELECT id FROM blog_posts WHERE slug = ?").get(document.slug) as { id: number } | undefined;
    const publishedAt = normalizePostDate(document.date);
    const textFA = blocksToText(document.translations.fa.content);
    const textEN = blocksToText(document.translations.en.content);
    const minutes = Math.max(1, Math.ceil(Math.max(textFA.split(/\s+/u).length, textEN.split(/\s+/u).length) / 200));
    const values = {
      slug: document.slug,
      document_json: JSON.stringify(document),
      title_fa: document.translations.fa.title,
      title_en: document.translations.en.title,
      excerpt_fa: document.translations.fa.excerpt,
      excerpt_en: document.translations.en.excerpt,
      body_fa: textFA,
      body_en: textEN,
      author_fa: localizeBlogText(document.author, "fa", "تحریریه"),
      author_en: localizeBlogText(document.author, "en", "Editorial team"),
      category_fa: localizeBlogText(document.category, "fa", "آموزش سلامت"),
      category_en: localizeBlogText(document.category, "en", "Health education"),
      image: document.featuredImage?.src ?? null,
      read_minutes: minutes,
      is_featured: Number(document.featured),
      is_published: Number(document.status === "published"),
      published_at: publishedAt,
      updated_at: normalizePostDate(document.updatedAt ?? document.date),
    };
    if (previous) {
      const assignments = Object.keys(values).map((key) => `${key} = @${key}`).join(", ");
      db.prepare(`UPDATE blog_posts SET ${assignments} WHERE id = @id`).run({ ...values, id: previous.id });
      return { id: previous.id, slug: document.slug, created: false };
    }
    const keys = Object.keys(values);
    const result = db.prepare(`INSERT INTO blog_posts (${keys.join(", ")}) VALUES (${keys.map((key) => `@${key}`).join(", ")})`).run(values);
    return { id: Number(result.lastInsertRowid), slug: document.slug, created: true };
  })();
}

export function readStoredBlogDocument(value: string | null | undefined): BlogDocument | undefined {
  return value ? parseBlogDocument(JSON.parse(value)) : undefined;
}