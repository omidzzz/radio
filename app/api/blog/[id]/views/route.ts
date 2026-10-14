import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/blog/[id]/views
 * Increments the view counter for a published blog post and returns
 * the updated count. Called once per session from the client-side
 * ViewCounter widget.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = Number.parseInt(id, 10);

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    const result = db
      .prepare(
        "UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = ? AND is_published = 1",
      )
      .run(postId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const row = db.prepare("SELECT views FROM blog_posts WHERE id = ?").get(
      postId,
    ) as { views: number | null } | undefined;

    return NextResponse.json({ views: row?.views ?? 0 });
  } catch (error) {
    console.error("Failed to increment blog views:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 },
    );
  }
}