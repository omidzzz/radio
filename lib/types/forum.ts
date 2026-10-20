/**
 * Forum domain types.
 *
 * `ForumPostRow` / `ForumReplyRow` mirror the SQLite columns and are used
 * only inside the service layer. `ForumPost` / `ForumReply` are the canonical
 * models consumed by the rest of the app.
 */

/** Raw `forum_posts` table row. */
export interface ForumPostRow {
  id: number;
  author_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  reply_count?: number;
}

/** Raw `forum_replies` table row. */
export interface ForumReplyRow {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  is_admin: number;
  created_at: string;
}

/** Canonical forum post model. */
export interface ForumPost {
  id: number;
  author_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  reply_count?: number;
}

/** Canonical forum reply model. */
export interface ForumReply {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  is_admin: number;
  created_at: string;
}

/** A forum post together with its replies (thread view). */
export interface ForumPostWithReplies extends ForumPost {
  replies: ForumReply[];
}

/** Payload for creating a new forum post. */
export interface NewForumPostInput {
  author_name: string;
  title: string;
  content: string;
  category: string;
}

/** Payload for creating a new forum reply. */
export interface NewForumReplyInput {
  post_id: number;
  author_name: string;
  content: string;
}