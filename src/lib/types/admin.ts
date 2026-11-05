/**
 * Admin dashboard types.
 *
 * These describe the payloads returned by the `/api/admin/*` endpoints and
 * consumed by the admin dashboard components.
 */

/** Aggregate counts shown on the admin overview tab. */
export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalForumPosts: number;
  totalForumReplies: number;
  totalMessages: number;
}

/** A single time-series bucket in the analytics dashboard. */
export interface AnalyticsBucket {
  date: string;
  count: number;
}

/** A booking grouped by its lifecycle status. */
export interface BookingStatusCount {
  status: string;
  count: number;
}

/** A forum post joined with its reply count. */
export interface ForumPostWithReplyCount {
  id: number;
  author_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  reply_count: number;
}

/** A blog post row as shown in the admin blog table. */
export interface AdminBlogPost {
  id: number;
  title_fa: string;
  title_en: string;
  excerpt_fa: string;
  author_fa: string;
  category_fa: string;
  is_published: number;
  published_at: string;
  created_at: string;
}

/** A blog comment awaiting moderation, with its parent post title. */
export interface PendingComment {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  created_at: string;
  post_title: string;
}