import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/forum/posts/[id] - Get a single post with its replies
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = db
      .prepare(
        `SELECT fp.*, 
          (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
         FROM forum_posts fp WHERE fp.id = ?`
      )
      .get(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const replies = db
      .prepare(
        "SELECT * FROM forum_replies WHERE post_id = ? ORDER BY created_at ASC"
      )
      .all(postId);

    return NextResponse.json({ post, replies });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}