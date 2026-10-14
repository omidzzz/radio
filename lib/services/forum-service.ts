import db, { prepare, syncForumPostFts } from "@/lib/db";
import { ForumPostValues, ForumReplyValues } from "@/lib/validation/forum";
import { ApiError } from "@/lib/api-error";

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
      .all(category, limit, offset) as any[];

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
    .all(limit, offset) as any[];

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  return { posts: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function createForumPost(input: ForumPostValues) {
  const result = prepare(
    `INSERT INTO forum_posts (author_name, title, content, category)
     VALUES (?, ?, ?, ?)`
  ).run(input.author_name, input.title, input.content, input.category);

  // Sync the new post into the FTS5 index so search finds it immediately
  syncForumPostFts(Number(result.lastInsertRowid));

  const post = prepare("SELECT * FROM forum_posts WHERE id = ?").get(
    result.lastInsertRowid
  );

  if (!post) {
    throw ApiError.internal("Failed to retrieve created post");
  }

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

  return reply;
}

export function deleteForumPost(id: number) {
  const result = db.prepare("DELETE FROM forum_posts WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw ApiError.notFound("Post not found");
  }
  return result;
}