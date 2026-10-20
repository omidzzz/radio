import { NextRequest, NextResponse } from "next/server";
import { getForumPostWithReplies } from "@/lib/services/forum-service";

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

    const { post, replies } = getForumPostWithReplies(postId);

    return NextResponse.json({ post, replies });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}