import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import { createAdminReply, deleteAdminReply } from "@/lib/services/admin-service";

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

    const newReply = createAdminReply(post_id, content);

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

    deleteAdminReply(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}