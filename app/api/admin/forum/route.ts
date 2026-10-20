import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import {
  deleteAdminForumPost,
  getAdminForumPosts,
} from "@/lib/services/admin-service";

// GET /api/admin/forum - List all forum posts with replies
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const posts = getAdminForumPosts();

    return NextResponse.json({ posts });
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

    deleteAdminForumPost(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return NextResponse.json(
      { error: "Failed to delete forum post" },
      { status: 500 }
    );
  }
}