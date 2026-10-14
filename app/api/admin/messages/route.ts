import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/auth";
import { ContactMessage } from "@/lib/types";

// GET /api/admin/messages - List all contact messages
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const messages = db
      .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
      .all() as ContactMessage[];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/messages - Delete a contact message
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const result = db
      .prepare("DELETE FROM contact_messages WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}