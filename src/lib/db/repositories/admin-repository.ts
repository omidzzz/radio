import type { BlogCommentRow } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { blogCache, statsCache, forumCache } from "@/lib/db/cache";
import { logger } from "@/lib/core/logger";

/**
 * Repository for admin dashboard data access.
 * Encapsulates aggregate queries used by the admin panel.
 */
export class AdminRepository extends BaseRepository<BlogCommentRow> {
  constructor() {
    super("blog_comments");
  }

  /** Aggregate stats for the admin overview tab. */
  getStats() {
    try {
      const row = this.prepareStmt(
        `SELECT
           (SELECT COUNT(*) FROM bookings) as totalBookings,
           (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pendingBookings,
           (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmedBookings,
           (SELECT COUNT(*) FROM forum_posts) as totalForumPosts,
           (SELECT COUNT(*) FROM forum_replies) as totalForumReplies,
           (SELECT COUNT(*) FROM contact_messages) as totalMessages`
      ).get() as {
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        totalForumPosts: number;
        totalForumReplies: number;
        totalMessages: number;
      };

      statsCache.clear();
      return row;
    } catch (error) {
      logger.error("AdminRepository.getStats failed", { error });
      throw error;
    }
  }
  /** Analytics data for the admin dashboard. */
  getAnalytics(range: string) {
    const dateFilter =
      range === "7d"
        ? "AND created_at >= date('now', '-7 days')"
        : range === "90d"
          ? "AND created_at >= date('now', '-90 days')"
          : "AND created_at >= date('now', '-30 days')";

    const bookingsOverTime = this.prepareStmt(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM bookings
       WHERE created_at >= date('now', '-30 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    ).all() as { day: string; count: number }[];

    const messagesOverTime = this.prepareStmt(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM contact_messages
       WHERE created_at >= date('now', '-30 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    ).all() as { day: string; count: number }[];

    const postsOverTime = this.prepareStmt(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM forum_posts
       WHERE created_at >= date('now', '-30 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    ).all() as { day: string; count: number }[];

    const statusBreakdown = this.prepareStmt(
      `SELECT status, COUNT(*) as count
       FROM bookings
       GROUP BY status
       ORDER BY count DESC`
    ).all() as { status: string; count: number }[];

    const sessionTypeBreakdown = this.prepareStmt(
      `SELECT session_type, COUNT(*) as count
       FROM bookings
       GROUP BY session_type
       ORDER BY count DESC`
    ).all() as { session_type: string; count: number }[];

    const recentActivity = this.prepareStmt(
      `SELECT 'booking' as type, id, full_name as title, created_at FROM bookings
       UNION ALL
       SELECT 'message' as type, id, subject as title, created_at FROM contact_messages
       ORDER BY created_at DESC
       LIMIT 10`
    ).all() as { type: string; id: number; title: string; created_at: string }[];

    return {
      bookingsOverTime,
      messagesOverTime,
      postsOverTime,
      statusBreakdown,
      sessionTypeBreakdown,
      recentActivity,
    };
  }

  /** List all forum posts grouped with their replies (admin thread view). */
  getAdminForumPosts() {
    const posts = this.prepareStmt(
      `SELECT fp.*,
              (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
       FROM forum_posts fp
       ORDER BY fp.created_at DESC`
    ).all() as Array<{
      id: number;
      title: string;
      content: string;
      category: string;
      created_at: string;
      reply_count: number;
    }>;

    const allReplies = this.prepareStmt(
      "SELECT * FROM forum_replies ORDER BY created_at ASC"
    ).all() as Array<{
      id: number;
      post_id: number;
      author_name: string;
      content: string;
      is_admin: number;
      created_at: string;
    }>;

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

  /** Delete a forum post (replies cascade via FK). */
  deleteAdminForumPost(id: number): boolean {
    const result = this.prepareStmt("DELETE FROM forum_posts WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw new Error("Post not found");
    }
    forumCache.clear();
    return true;
  }

  /** List comments pending moderation, with post titles for context. */
  getPendingComments() {
    return this.prepareStmt(
      `SELECT c.id, c.post_id, c.author_name, c.content, c.created_at,
              p.title_fa AS post_title
       FROM blog_comments c
       JOIN blog_posts p ON p.id = c.post_id
       WHERE c.is_approved = 0
       ORDER BY c.created_at DESC
       LIMIT 100`
    ).all();
  }

  /** Approve a pending comment. */
  approveComment(id: number): boolean {
    const result = this.prepareStmt(
      "UPDATE blog_comments SET is_approved = 1 WHERE id = ?"
    ).run(id);
    if (result.changes === 0) {
      throw new Error("Comment not found");
    }
    blogCache.clear();
    return true;
  }

  /** Reject (delete) a comment. */
  deleteComment(id: number): boolean {
    const result = this.prepareStmt("DELETE FROM blog_comments WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw new Error("Comment not found");
    }
    return true;
  }

  /** Admin creates a reply on a forum post. */
  createAdminReply(postId: number, content: string) {
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
    ).get(result.lastInsertRowid);

    forumCache.clear();
    return newReply;
  }

  /** Admin deletes a forum reply. */
  deleteAdminReply(id: number): boolean {
    const result = this.prepareStmt("DELETE FROM forum_replies WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw new Error("Reply not found");
    }
    forumCache.clear();
    return true;
  }

  /** List all blog posts for the admin blog table. */
  getAdminBlogPosts() {
    return this.prepareStmt(
      `SELECT id, title_fa, title_en, excerpt_fa, author_fa, category_fa,
              is_published, published_at, created_at
       FROM blog_posts ORDER BY created_at DESC`
    ).all();
  }
}

export const adminRepository = new AdminRepository();