import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/auth";
import { sanitizeContent } from "@/lib/sanitize";
import { forumCache } from "@/lib/cache";

// POST /api/admin/forum/replies - Admin posts a reply
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { post_id, content } = body;

    if (!post_id || !content?.trim()) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = db
      .prepare("SELECT id FROM forum_posts WHERE id = ?")
      .get(Number(post_id));
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeContent(content.trim());

    // Insert reply with is_admin = 1
    const result = db
      .prepare(
        `INSERT INTO forum_replies (post_id, author_name, content, is_admin) 
         VALUES (?, ?, ?, 1)`
      )
      .run(Number(post_id), "Admin", sanitizedContent);

    const newReply = db
      .prepare("SELECT * FROM forum_replies WHERE id = ?")
      .get(result.lastInsertRowid);

    // Invalidate forum cache after creating reply
    forumCache.clear();

    return NextResponse.json({ reply: newReply }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/forum/replies - Delete a reply
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Reply ID is required" },
        { status: 400 }
      );
    }

    const result = db.prepare("DELETE FROM forum_replies WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    // Invalidate forum cache after deleting reply
    forumCache.clear();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}