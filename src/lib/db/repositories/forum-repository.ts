import type { ForumPost, ForumPostRow, ForumReply, ForumReplyRow } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { forumCache } from "@/lib/db/cache";
import { logger } from "@/lib/core/logger";

const FORUM_CACHE_PREFIX = "forum";

/**
 * Repository for forum_posts and forum_replies tables.
 */
export class ForumRepository extends BaseRepository<ForumPostRow> {
  constructor() {
    super("forum_posts");
  }

  /** List posts with reply counts and pagination. */
  listWithCounts(options: {
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    if (category && category !== "all") {
      const rows = this.prepareStmt(
        `SELECT fp.*, COUNT(fr.id) as reply_count,
                COUNT(*) OVER() AS total_count
         FROM forum_posts fp
         LEFT JOIN forum_replies fr ON fr.post_id = fp.id
         WHERE fp.category = ?
         GROUP BY fp.id
         ORDER BY fp.created_at DESC
         LIMIT ? OFFSET ?`
      ).all(category, limit, offset) as Array<
        ForumPostRow & { reply_count: number; total_count: number }
      >;

      const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

      return {
        posts: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const rows = this.prepareStmt(
      `SELECT fp.*, COUNT(fr.id) as reply_count,
              COUNT(*) OVER() AS total_count
       FROM forum_posts fp
       LEFT JOIN forum_replies fr ON fr.post_id = fp.id
       GROUP BY fp.id
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset) as Array<
      ForumPostRow & { reply_count: number; total_count: number }
    >;

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    return {
      posts: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Lightweight post summaries for the index page. */
  listSummaries(options: {
    category?: string;
    page?: number;
    limit?: number;
    sort?: "newest" | "replies";
  }) {
    const { category, page = 1, limit = 10, sort = "newest" } = options;
    const cacheKey = `${FORUM_CACHE_PREFIX}:summaries:${category ?? "all"}:${page}:${limit}:${sort}`;
    const cached = forumCache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;
    const orderBy =
      sort === "replies"
        ? "ORDER BY reply_count DESC, fp.created_at DESC"
        : "ORDER BY fp.created_at DESC";

    const baseSelect = `SELECT fp.id, fp.title, fp.category, fp.author_name, fp.created_at,
             substr(fp.content, 1, 220) AS excerpt,
             COUNT(fr.id) AS reply_count,
             COUNT(*) OVER() AS total_count
       FROM forum_posts fp
       LEFT JOIN forum_replies fr ON fr.post_id = fp.id`;

    const rows = (category && category !== "all"
      ? this.prepareStmt(
          baseSelect + ` WHERE fp.category = ? GROUP BY fp.id ${orderBy} LIMIT ? OFFSET ?`
        ).all(category, limit, offset)
      : this.prepareStmt(
          baseSelect + ` GROUP BY fp.id ${orderBy} LIMIT ? OFFSET ?`
        ).all(limit, offset)) as Array<{
      id: number;
      title: string;
      category: string;
      author_name: string;
      created_at: string;
      excerpt: string;
      reply_count: number;
      total_count: number;
    }>;

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    const result = {
      posts: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    forumCache.set(cacheKey, result);
    return result;
  }

  /** Find a post by id. */
  findById(id: number): ForumPostRow | undefined {
    const cacheKey = `${FORUM_CACHE_PREFIX}:post:${id}`;
    const cached = forumCache.get(cacheKey);
    if (cached) return cached as ForumPostRow;

    const post = super.findById(id);
    if (post) forumCache.set(cacheKey, post);
    return post;
  }

  /** Create a new forum post. Clears related cache. */
  create(data: Record<string, unknown>): ForumPostRow {
    try {
      const result = this.prepareStmt(
        `INSERT INTO forum_posts (author_name, title, content, category)
         VALUES (?, ?, ?, ?)`
      ).run(data.author_name, data.title, data.content, data.category);

      const post = this.prepareStmt("SELECT * FROM forum_posts WHERE id = ?").get(
        result.lastInsertRowid
      ) as ForumPostRow | undefined;

      if (!post) throw new Error("Failed to retrieve created post");

      forumCache.clear();
      return post;
    } catch (error) {
      logger.error("ForumRepository.create failed", { error, data });
      throw error;
    }
  }

  /** Delete a forum post. Clears related cache. */
  delete(id: number): boolean {
    const deleted = super.delete(id);
    if (deleted) forumCache.clear();
    return deleted;
  }

  /** Reply operations */
  listReplies(postId: number): ForumReplyRow[] {
    return this.prepareStmt(
      `SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC`
    ).all(postId) as ForumReplyRow[];
  }

  listRepliesPaginated(postId: number, limit: number, offset: number) {
    const key = `${FORUM_CACHE_PREFIX}:replies:${postId}:${limit}:${offset}`;
    const cached = forumCache.get(key);
    if (cached) return cached;

    const rows = this.prepareStmt(
      `SELECT fr.*,
              COUNT(*) OVER() AS total_count,
              SUM(CASE WHEN fr.is_admin = 1 THEN 1 ELSE 0 END) OVER() AS admin_count
       FROM forum_replies fr
       WHERE post_id = ?
       ORDER BY created_at ASC
       LIMIT ? OFFSET ?`
    ).all(postId, limit, offset) as Array<
      ForumReplyRow & { total_count: number; admin_count: number }
    >;

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const adminCount = rows.length > 0 ? Number(rows[0].admin_count) : 0;

    const replies: ForumReply[] = rows.map((r) => ({
      id: r.id,
      post_id: r.post_id,
      author_name: r.author_name,
      content: r.content,
      is_admin: r.is_admin,
      created_at: r.created_at,
    }));

    const result = { replies, total, adminCount };
    forumCache.set(key, result);
    return result;
  }

  createReply(data: Record<string, unknown>): ForumReplyRow {
    const post = this.prepareStmt("SELECT id FROM forum_posts WHERE id = ?").get(
      data.post_id
    );
    if (!post) throw new Error("Post not found");

    const result = this.prepareStmt(
      `INSERT INTO forum_replies (post_id, author_name, content)
       VALUES (?, ?, ?)`
    ).run(data.post_id, data.author_name, data.content);

    const reply = this.prepareStmt(
      "SELECT * FROM forum_replies WHERE id = ?"
    ).get(result.lastInsertRowid) as ForumReplyRow | undefined;

    if (!reply) throw new Error("Failed to retrieve created reply");

    forumCache.clear();
    return reply;
  }

  deleteReply(id: number): boolean {
    const deleted = this.prepareStmt("DELETE FROM forum_replies WHERE id = ?").run(
      id
    );
    if (deleted.changes > 0) forumCache.clear();
    return deleted.changes > 0;
  }

  createAdminReply(postId: number, content: string): ForumReplyRow {
    const post = this.prepareStmt("SELECT id FROM forum_posts WHERE id = ?").get(
      postId
    );
    if (!post) throw new Error("Post not found");

    const result = this.prepareStmt(
      `INSERT INTO forum_replies (post_id, author_name, content, is_admin)
       VALUES (?, ?, ?, 1)`
    ).run(postId, "Admin", content);

    const newReply = this.prepareStmt(
      "SELECT * FROM forum_replies WHERE id = ?"
    ).get(result.lastInsertRowid) as ForumReplyRow | undefined;

    if (!newReply) throw new Error("Failed to retrieve created reply");

    forumCache.clear();
    return newReply;
  }

  /** Admin: list all posts grouped with replies (thread view). */
  getAdminThreadView() {
    const posts = this.prepareStmt(
      `SELECT fp.*,
              (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
       FROM forum_posts fp
       ORDER BY fp.created_at DESC`
    ).all() as Array<ForumPostRow & { reply_count: number }>;

    const allReplies = this.prepareStmt(
      "SELECT * FROM forum_replies ORDER BY created_at ASC"
    ).all() as ForumReplyRow[];

    const repliesByPost = new Map<number, typeof allReplies>();
    for (const reply of allReplies) {
      const list = repliesByPost.get(reply.post_id) || [];
      list.push(reply);
      repliesByPost.set(reply.post_id, list);
    }

    return posts.map((post) => ({
      ...post,
      replies: repliesByPost.get(post.id) || [],
    }));
  }
}

export const forumRepository = new ForumRepository();