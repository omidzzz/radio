import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminWithCsrf, requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/comments — list comments pending moderation
 * (with post titles for context).
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const pending = db
      .prepare(
        `SELECT c.id, c.post_id, c.author_name, c.content, c.created_at,
                p.title_fa AS post_title
         FROM blog_comments c
         JOIN blog_posts p ON p.id = c.post_id
         WHERE c.is_approved = 0
         ORDER BY c.created_at DESC
         LIMIT 100`
      )
      .all();

    return NextResponse.json({ comments: pending });
  } catch (error) {
    console.error("Error fetching pending comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/comments — approve a comment
 * Body: { id: number }
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { id?: number };
    if (!body.id) {
      return NextResponse.json({ error: "Comment id required" }, { status: 400 });
    }

    const result = db
      .prepare("UPDATE blog_comments SET is_approved = 1 WHERE id = ?")
      .run(body.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving comment:", error);
    return NextResponse.json(
      { error: "Failed to approve comment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/comments?id=123 — reject (delete) a comment
 */
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Comment id required" }, { status: 400 });
    }

    const result = db
      .prepare("DELETE FROM blog_comments WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}