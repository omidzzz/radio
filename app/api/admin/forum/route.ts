import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/auth";
import { ForumPost, ForumReply } from "@/lib/types";

// GET /api/admin/forum - List all forum posts with replies
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    // Single query with LEFT JOIN to avoid N+1
    const posts = db
      .prepare(
        `SELECT fp.*, 
          (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
         FROM forum_posts fp 
         ORDER BY fp.created_at DESC`
      )
      .all() as ForumPost[];

    // Fetch all replies in one query, then group by post_id in memory
    const allReplies = db
      .prepare("SELECT * FROM forum_replies ORDER BY created_at ASC")
      .all() as ForumReply[];

    const repliesByPost = new Map<number, ForumReply[]>();
    for (const reply of allReplies) {
      const list = repliesByPost.get(reply.post_id) || [];
      list.push(reply);
      repliesByPost.set(reply.post_id, list);
    }

    const postsWithReplies = posts.map((post) => ({
      ...post,
      replies: repliesByPost.get(post.id) || [],
    }));

    return NextResponse.json({ posts: postsWithReplies });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/forum - Delete a forum post (and its replies via FK cascade)
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const result = db.prepare("DELETE FROM forum_posts WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return NextResponse.json(
      { error: "Failed to delete forum post" },
      { status: 500 }
    );
  }
}