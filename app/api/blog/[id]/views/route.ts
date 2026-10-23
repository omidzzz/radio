import { NextRequest, NextResponse } from "next/server";
import { incrementBlogViews } from "@/lib/services/blog-service";
import { logger } from "@/lib/core/logger";

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
    const result = incrementBlogViews(postId);

    if (!result) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to increment blog views", { error: error });
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 },
    );
  }
}