/**
 * Blog domain types.
 *
 * Three shapes exist for a blog post, each with an explicit name so the
 * boundaries are never ambiguous:
 *
 *   BlogPostRow    — raw `blog_posts` / `blog_comments` table row (snake_case,
 *                    mirrors the SQLite columns exactly). Only used inside
 *                    the service layer, right after a query.
 *   BlogPost       — canonical domain model (camelCase). The shape the rest
 *                    of the app consumes. Produced by `formatBlogPost()`.
 *   BlogPostSummary— lightweight projection for list/card views. Omits the
 *                    heavy body fields.
 */

/** Raw `blog_posts` table row — mirrors the SQLite column names. */
export interface BlogPostRow {
  id: number;
  title_fa: string;
  title_en: string | null;
  excerpt_fa: string;
  excerpt_en: string | null;
  body_fa: string;
  body_en: string | null;
  author_fa: string;
  author_en: string | null;
  category_fa: string;
  category_en: string | null;
  image: string | null;
  read_minutes: number;
  is_featured: number;
  is_published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views?: number | null;
}

/** Canonical blog post model used across services, API routes and pages. */
export interface BlogPost {
  id: number;
  titleFA: string;
  titleEN?: string;
  excerptFA: string;
  excerptEN?: string;
  bodyFA: string;
  bodyEN?: string;
  authorFA: string;
  authorEN?: string;
  categoryFA: string;
  categoryEN?: string;
  image?: string;
  readMinutes: number;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views?: number | null;
}

/**
 * Lightweight post projection for listing pages and post cards.
 * Deliberately excludes `bodyFA`/`bodyEN` to keep list payloads small.
 */
export interface BlogPostSummary {
  id: number;
  titleFA: string;
  titleEN?: string;
  excerptFA?: string;
  excerptEN?: string;
  authorFA: string;
  authorEN?: string;
  categoryFA: string;
  categoryEN?: string;
  image?: string;
  readMinutes: number;
  publishedAt?: string;
  views?: number | null;
}

/** Raw `blog_comments` table row. */
export interface BlogCommentRow {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  created_at: string;
}

/** Canonical blog comment model. */
export interface BlogComment {
  id: number;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
}