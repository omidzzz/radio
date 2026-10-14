import { z } from "zod";

export const ForumPostSchema = z.object({
  author_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  title: z.string().min(2, "Title must be at least 2 characters").max(300),
  content: z.string().min(2, "Content must be at least 2 characters").max(10000),
  category: z.enum(["general", "treatment", "support", "other"]).default("general"),
});

export type ForumPostValues = z.infer<typeof ForumPostSchema>;

export function validateForumPost(
  data: unknown
): { success: true; data: ForumPostValues } | { success: false; errors: string[] } {
  const result = ForumPostSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err) => err.message),
  };
}

export const ForumReplySchema = z.object({
  post_id: z.number().int().positive("Invalid post ID"),
  author_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  content: z.string().min(2, "Content must be at least 2 characters").max(5000),
});

export type ForumReplyValues = z.infer<typeof ForumReplySchema>;

export function validateForumReply(
  data: unknown
): { success: true; data: ForumReplyValues } | { success: false; errors: string[] } {
  const result = ForumReplySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err) => err.message),
  };
}