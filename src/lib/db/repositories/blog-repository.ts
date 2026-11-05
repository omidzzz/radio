import type { BlogCommentRow, BlogPostRow } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { blogCache } from "@/lib/db/cache";
import { logger } from "@/lib/core/logger";

const BLOG_CACHE_PREFIX = "repository:blog";

/**
 * Repository for blog_posts and blog_comments tables.
 * Encapsulates all SQL for blog data access. Services consume this
 * repository rather than calling db.prepare() directly.
 */
export class BlogRepository extends BaseRepository<BlogPostRow> {
  constructor() {
    super("blog_posts");
  }

  /** List published posts with full columns and pagination. */
  listPublished(options: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const cacheKey = `${BLOG_CACHE_PREFIX}:list:${page}:${limit}`;
    const cached = blogCache.get(cacheKey);
    if (cached) return cached;

    const rows = this.prepareStmt(
      `SELECT id, slug, document_json, title_fa, title_en, excerpt_fa, excerpt_en,
              author_fa, author_en, category_fa, category_en, image,
              read_minutes, published_at, views,
              body_fa, body_en, is_featured, is_published, created_at, updated_at,
              COUNT(*) OVER() AS total_count
       FROM blog_posts
       WHERE is_published = 1
       ORDER BY published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset) as (BlogPostRow & { total_count: number })[];

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const result = {
      posts: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    blogCache.set(cacheKey, result);
    return result;
  }

  /** List all categories that have published posts. */
  listCategories(): string[] {
    const rows = this.prepareStmt(
      `SELECT DISTINCT category_fa FROM blog_posts WHERE is_published = 1 ORDER BY category_fa`
    ).all() as { category_fa: string }[];
    return rows.map((r) => r.category_fa);
  }

  /** Find a published JSON slug or a legacy numeric id. */
  findPublishedBySlug(slug: string): BlogPostRow | undefined {
    const cacheKey = `${BLOG_CACHE_PREFIX}:post:${slug}`;
    const cached = blogCache.get(cacheKey);
    if (cached) return cached as BlogPostRow;

    const post = this.prepareStmt(
      `SELECT * FROM blog_posts WHERE (slug = ? OR CAST(id AS TEXT) = ?) AND is_published = 1`
    ).get(slug, slug) as BlogPostRow | undefined;

    if (post) blogCache.set(cacheKey, post);
    return post;
  }

  /** Find any post by id (published or not). */
  findById(id: number): BlogPostRow | undefined {
    return super.findById(id);
  }

  /** Create a new blog post. Clears related cache. */
  create(data: Record<string, unknown>): BlogPostRow {
    const created = super.create(data);
    blogCache.clear();
    return created;
  }

  /** Update a blog post. Clears related cache. */
  update(id: number, data: Record<string, unknown>): BlogPostRow | undefined {
    const updated = super.update(id, data);
    if (updated) blogCache.clear();
    return updated;
  }

  /** Delete a blog post. Clears related cache. */
  delete(id: number): boolean {
    const deleted = super.delete(id);
    if (deleted) blogCache.clear();
    return deleted;
  }

  /** Increment view counter for a published post. */
  incrementViews(id: number): { views: number } | undefined {
    try {
      const result = this.prepareStmt(
        `UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = ? AND is_published = 1`
      ).run(id);

      if (result.changes === 0) return undefined;

      const row = this.prepareStmt("SELECT views FROM blog_posts WHERE id = ?").get(
        id
      ) as { views: number | null } | undefined;

      return { views: row?.views ?? 0 };
    } catch (error) {
      logger.error("BlogRepository.incrementViews failed", { error, id });
      throw error;
    }
  }

  /** Comment operations */
  listComments(postId: number): BlogCommentRow[] {
    const cacheKey = `${BLOG_CACHE_PREFIX}:comments:${postId}`;
    const cached = blogCache.get(cacheKey);
    if (cached) return cached as BlogCommentRow[];

    const rows = this.prepareStmt(
      `SELECT * FROM blog_comments WHERE post_id = ? ORDER BY created_at ASC`
    ).all(postId) as BlogCommentRow[];

    blogCache.set(cacheKey, rows);
    return rows;
  }

  createComment(data: Record<string, unknown>): BlogCommentRow {
    try {
      const result = this.prepareStmt(
        `INSERT INTO blog_comments (post_id, author_name, content, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(data.post_id, data.author_name, data.content);

      const created = this.prepareStmt(
        "SELECT * FROM blog_comments WHERE id = ?"
      ).get(result.lastInsertRowid) as BlogCommentRow | undefined;

      if (!created) throw new Error("Failed to retrieve created comment");

      blogCache.clear();
      return created;
    } catch (error) {
      logger.error("BlogRepository.createComment failed", { error, data });
      throw error;
    }
  }
}

export const blogRepository = new BlogRepository();