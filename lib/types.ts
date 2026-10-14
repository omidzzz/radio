export interface ForumPost {
  id: number;
  author_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  reply_count?: number;
}

export interface ForumReply {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  is_admin: number;
  created_at: string;
}

export interface ForumPostWithReplies extends ForumPost {
  replies: ForumReply[];
}

export interface Booking {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface NewForumPostInput {
  author_name: string;
  title: string;
  content: string;
  category: string;
}

export interface NewForumReplyInput {
  post_id: number;
  author_name: string;
  content: string;
}

export interface NewBookingInput {
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
}

export interface NewContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}