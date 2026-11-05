import type { SearchResult } from "@/lib/services/search-service";
import db from "@/lib/db/db";

/**
 * Repository for full-text search across blog_posts and forum_posts.
 * Uses SQLite FTS5 virtual tables.
 */
export class SearchRepository {
  /** Search blog posts using FTS5. */
  searchBlogs(term: string, limit: number, locale: string): SearchResult[] {
    try {
      const rows = db
        .prepare(
          `SELECT b.id, b.slug,
                  CASE WHEN @locale = 'en' THEN COALESCE(b.title_en, b.title_fa) ELSE b.title_fa END AS title,
                  CASE WHEN @locale = 'en' THEN COALESCE(b.excerpt_en, b.excerpt_fa) ELSE b.excerpt_fa END AS context,
                  CASE WHEN @locale = 'en' THEN COALESCE(b.category_en, b.category_fa) ELSE b.category_fa END AS category,
                  b.published_at as date, b.image
           FROM blog_posts_fts JOIN blog_posts b ON b.id = blog_posts_fts.rowid
           WHERE blog_posts_fts MATCH @term AND b.is_published = 1
           ORDER BY rank
           LIMIT @limit`
        )
        .all({ term, limit, locale }) as Array<{
        id: number;
        slug: string | null;
        title: string;
        context: string;
        category?: string;
        date?: string;
        image?: string;
      }>;

      return rows.map((r) => ({
        id: String(r.id),
        type: "blog" as const,
        title: r.title,
        context: r.context,
        url: `/${locale === "en" ? "en" : "fa"}/blog/${r.slug || r.id}`,
        category: r.category,
        date: r.date,
        image: r.image,
      }));
    } catch {
      // FTS5 might not be available
      return [];
    }
  }

  /** Search forum posts using FTS5. */
  searchForums(term: string, limit: number, locale: string): SearchResult[] {
    try {
      const rows = db
        .prepare(
          `SELECT id, title, content as context, category, created_at as date
           FROM forum_posts_fts
           WHERE forum_posts_fts MATCH ?
           ORDER BY rank
           LIMIT ?`
        )
        .all(term, limit) as Array<{
        id: number;
        title: string;
        context: string;
        category?: string;
        date?: string;
      }>;

      return rows.map((r) => ({
        id: String(r.id),
        type: "forum" as const,
        title: r.title,
        context: r.context,
        url: `/forum/${r.id}`,
        category: r.category,
        date: r.date,
      }));
    } catch {
      return [];
    }
  }
}

export const searchRepository = new SearchRepository();