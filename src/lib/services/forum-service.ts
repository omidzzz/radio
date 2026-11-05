import db, { prepare } from "@/lib/db/db";
import { forumCache } from "@/lib/db/cache";
import { ForumPostValues, ForumReplyValues } from "@/lib/validation/forum";
import { ApiError } from "@/lib/http/api-error";
import type { ForumPost, ForumReply } from "@/lib/types";

/** `forum_posts` row augmented with the two aggregates `getForumPosts` computes. */
type ForumPostWithCounts = ForumPost & {
  reply_count: number;
  total_count: number;
};

export function getForumPosts(options: {
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { category, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  if (category && category !== "all") {
    const rows = db
      .prepare(
        `SELECT fp.*, COUNT(fr.id) as reply_count,
                COUNT(*) OVER() AS total_count
         FROM forum_posts fp
         LEFT JOIN forum_replies fr ON fr.post_id = fp.id
         WHERE fp.category = ?
         GROUP BY fp.id
         ORDER BY fp.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(category, limit, offset) as ForumPostWithCounts[];

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    return { posts: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  const rows = db
    .prepare(
      `SELECT fp.*, COUNT(fr.id) as reply_count,
              COUNT(*) OVER() AS total_count
       FROM forum_posts fp
       LEFT JOIN forum_replies fr ON fr.post_id = fp.id
       GROUP BY fp.id
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as ForumPostWithCounts[];

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  return { posts: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function createForumPost(input: ForumPostValues) {
  const result = prepare(
    `INSERT INTO forum_posts (author_name, title, content, category)
     VALUES (?, ?, ?, ?)`
  ).run(input.author_name, input.title, input.content, input.category);

  const post = prepare("SELECT * FROM forum_posts WHERE id = ?").get(
    result.lastInsertRowid
  );

  if (!post) {
    throw ApiError.internal("Failed to retrieve created post");
  }

  // Invalidate cached post/reply lookups so the new thread is surfaced.
  forumCache.clear();
  return post;
}

export function getForumPost(id: number) {
  const post = db
    .prepare("SELECT * FROM forum_posts WHERE id = ?")
    .get(id);

  if (!post) {
    throw ApiError.notFound("Post not found");
  }

  return post;
}

export function getForumReplies(postId: number) {
  return db
    .prepare("SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC")
    .all(postId);
}

export function createForumReply(input: ForumReplyValues) {
  // Verify post exists
  const post = db
    .prepare("SELECT id FROM forum_posts WHERE id = ?")
    .get(input.post_id);

  if (!post) {
    throw ApiError.notFound("Post not found");
  }

  const result = db
    .prepare(
      `INSERT INTO forum_replies (post_id, author_name, content)
       VALUES (?, ?, ?)`
    )
    .run(input.post_id, input.author_name, input.content);

  const reply = db
    .prepare("SELECT * FROM forum_replies WHERE id = ?")
    .get(result.lastInsertRowid);

  if (!reply) {
    throw ApiError.internal("Failed to retrieve created reply");
  }

  forumCache.clear();
  return reply;
}
/** Delete a forum post (replies cascade via FK). */
export function deleteForumPost(id: number) {
  const result = db.prepare("DELETE FROM forum_posts WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw ApiError.notFound("Post not found");
  }
  // Invalidate cached post/reply lookups so deleted threads disappear.
  forumCache.clear();
  return result;
}

/** List forum posts for the sitemap (id + created_at). */
export function listForumPostsForSitemap(): {
  id: number;
  created_at: string;
}[] {
  return db
    .prepare(`SELECT id, created_at FROM forum_posts`)
    .all() as { id: number; created_at: string }[];
}

/** All forum posts (published) — for static param generation. */
export function listPublishedForumPosts() {
  return db
    .prepare("SELECT id FROM forum_posts WHERE is_published = 1 ORDER BY created_at DESC")
    .all() as { id: number }[];
}

/** Get a single post together with its replies (public thread view). */
export function getForumPostWithReplies(id: number) {
  const post = getForumPost(id);
  const replies = getForumReplies(id);
  return { post, replies };
}

/** Paginate replies for a post, returning the requested window plus total. */
export function listRepliesForPost(postId: number, limit: number, offset: number) {
  const rows = db
    .prepare("SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?")
    .all(postId, limit, offset) as Array<{ id: number; post_id: number; author_name: string; content: string; is_admin: number; created_at: string }>;

  const total = db
    .prepare("SELECT COUNT(*) AS c FROM forum_replies WHERE post_id = ?")
    .get(postId) as { c: number };

  return { replies: rows, total: total.c };
}

/**
 * Cached single-post lookup (60s TTL via the global forumCache).
 * Shared between `generateMetadata` and the page body so the row is read
 * from SQLite at most once per request and reused across ISR revalidations.
 */
export function getCachedForumPost(postId: number): ForumPost | undefined {
  const key = `post:${postId}`;
  const cached = forumCache.get(key) as ForumPost | undefined;
  if (cached) return cached;

  const row = db
    .prepare("SELECT * FROM forum_posts WHERE id = ?")
    .get(postId) as ForumPost | undefined;

  if (row) forumCache.set(key, row);
  return row;
}

/**
 * Cached reply window for a thread. Returns the paged replies together with
 * the *total* reply count and the *admin* reply count in a single SQLite
 * pass — the window functions (`COUNT(*) OVER()`, `SUM(...) OVER()`) run over
 * the full partition, so LIMIT/OFFSET only slices the returned rows, not the
 * aggregates. Eliminates the 3 separate db queries the page previously ran.
 */
export function listCachedRepliesForPost(
  postId: number,
  limit: number,
  offset: number
): { replies: ForumReply[]; total: number; adminCount: number } {
  const key = `replies:${postId}:${limit}:${offset}`;
  const cached = forumCache.get(key) as
    | { replies: ForumReply[]; total: number; adminCount: number }
    | undefined;
  if (cached) return cached;

  const rows = db
    .prepare(
      `SELECT fr.*,
              COUNT(*) OVER() AS total_count,
              SUM(CASE WHEN fr.is_admin = 1 THEN 1 ELSE 0 END) OVER() AS admin_count
       FROM forum_replies fr
       WHERE post_id = ?
       ORDER BY created_at ASC
       LIMIT ? OFFSET ?`
    )
    .all(postId, limit, offset) as Array<
    ForumReply & { total_count: number; admin_count: number }
  >;

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const adminCount = rows.length > 0 ? Number(rows[0].admin_count) : 0;

  // Window-function aggregates are constant across the partition; project
  // only the canonical ForumReply columns so cached rows stay clean.
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

/** Forum post summary list for the forum index page (lightweight). */
export type ForumSort = "newest" | "replies";

/** Lightweight list projection — only the columns the index renders. */
export interface ForumPostSummary {
  id: number;
  title: string;
  category: string;
  author_name: string;
  created_at: string;
  excerpt: string;
  reply_count: number;
  total_count: number;
}

export interface ForumPostListResult {
  posts: ForumPostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function listForumPostSummaries(options: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: ForumSort;
}) {
  const { category, page = 1, limit = 10, sort = "newest" } = options;
  const cacheKey = `forum:summaries:${category ?? "all"}:${page}:${limit}:${sort}`;
  const cached = forumCache.get(cacheKey) as ForumPostListResult | undefined;
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
    ? db
        .prepare(
          baseSelect +
            ` WHERE fp.category = ? GROUP BY fp.id ${orderBy} LIMIT ? OFFSET ?`
        )
        .all(category, limit, offset)
    : db
        .prepare(
          baseSelect +
            ` GROUP BY fp.id ${orderBy} LIMIT ? OFFSET ?`
        )
        .all(limit, offset)) as ForumPostSummary[];

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const result: ForumPostListResult = {
    posts: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  forumCache.set(cacheKey, result);
  return result;
}