import db from "@/lib/db";
import { BlogPost } from "@/lib/types/blog";

/**
 * Format a raw DB row into the camelCase BlogPost shape.
 * Shared between GET and POST handlers in the blog API route.
 */
export function formatBlogPost(post: any): BlogPost {
  return {
    id: post.id,
    titleFA: post.title_fa,
    titleEN: post.title_en,
    excerptFA: post.excerpt_fa,
    excerptEN: post.excerpt_en,
    bodyFA: post.body_fa,
    bodyEN: post.body_en,
    authorFA: post.author_fa,
    authorEN: post.author_en,
    categoryFA: post.category_fa,
    categoryEN: post.category_en,
    image: post.image,
    readMinutes: post.read_minutes,
    isFeatured: Boolean(post.is_featured),
    isPublished: Boolean(post.is_published),
    publishedAt: post.published_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

/**
 * Estimate reading time (minutes) from an HTML article body.
 * Strips tags, counts words, assumes ~200 words per minute.
 */
export function estimateReadMinutes(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Escape a search term for safe use in FTS5 MATCH queries.
 * FTS5 uses double-quotes for phrases and supports prefix matching with *.
 */
function escapeFtsTerm(term: string): string {
  // Strip FTS5 special characters and wrap in quotes for exact phrase matching
  const cleaned = term.replace(/["*^(){}[\]~:+-]/g, " ").trim();
  if (!cleaned) return "";
  // Use prefix matching on the last word for better UX (e.g. "radio" matches "radiotherapy")
  const words = cleaned.split(/\s+/);
  const lastWord = words[words.length - 1];
  const prefixWords = words.slice(0, -1);
  const escaped = [...prefixWords, `${lastWord}*`]
    .map((w) => `"${w.replace(/"/g, '""')}"`)
    .join(" ");
  return escaped;
}

/**
 * Search blog posts by query term using FTS5 full-text search.
 * Falls back to LIKE search if FTS5 is unavailable.
 * Shared between the server-rendered search page and the search API route.
 */
export function searchBlogPosts(searchTerm: string, limit = 10) {
  // If the term already has % wildcards (from search page), strip them for FTS
  const rawTerm = searchTerm.replace(/%/g, "").trim();
  const ftsQuery = escapeFtsTerm(rawTerm);

  if (ftsQuery) {
    try {
      const rows = db
        .prepare(
          `SELECT b.id, b.title_fa, b.title_en, b.excerpt_fa, b.excerpt_en, b.image, b.published_at, 'blog' as type
           FROM blog_posts_fts f
           JOIN blog_posts b ON b.id = f.rowid
           WHERE blog_posts_fts MATCH ? AND b.is_published = 1
           ORDER BY b.published_at DESC
           LIMIT ?`
        )
        .all(ftsQuery, limit) as any[];
      if (rows.length > 0) return rows;
    } catch {
      // FTS5 not available — fall through to LIKE search
    }
  }

  // Fallback: LIKE search (works even without FTS5)
  const likeTerm = `%${rawTerm}%`;
  return db
    .prepare(
      `SELECT id, title_fa, title_en, excerpt_fa, excerpt_en, image, published_at, 'blog' as type
       FROM blog_posts 
       WHERE is_published = 1 
         AND (title_fa LIKE ? OR title_en LIKE ? OR excerpt_fa LIKE ? OR excerpt_en LIKE ? OR category_fa LIKE ? OR category_en LIKE ?)
       ORDER BY published_at DESC
       LIMIT ?`
    )
    .all(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, limit);
}

/**
 * Search forum posts by query term using FTS5 full-text search.
 * Falls back to LIKE search if FTS5 is unavailable.
 * Shared between the server-rendered search page and the search API route.
 */
export function searchForumPosts(searchTerm: string, limit = 10) {
  // If the term already has % wildcards (from search page), strip them for FTS
  const rawTerm = searchTerm.replace(/%/g, "").trim();
  const ftsQuery = escapeFtsTerm(rawTerm);

  if (ftsQuery) {
    try {
      const rows = db
        .prepare(
          `SELECT fp.id, fp.title, fp.content, fp.author_name, fp.created_at, 'forum' as type
           FROM forum_posts_fts f
           JOIN forum_posts fp ON fp.id = f.rowid
           WHERE forum_posts_fts MATCH ?
           ORDER BY fp.created_at DESC
           LIMIT ?`
        )
        .all(ftsQuery, limit) as any[];
      if (rows.length > 0) return rows;
    } catch {
      // FTS5 not available — fall through to LIKE search
    }
  }

  // Fallback: LIKE search (works even without FTS5)
  const likeTerm = `%${rawTerm}%`;
  return db
    .prepare(
      `SELECT id, title, content, author_name, created_at, 'forum' as type
       FROM forum_posts 
       WHERE title LIKE ? OR content LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(likeTerm, likeTerm, limit);
}
