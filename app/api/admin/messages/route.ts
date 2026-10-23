import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import {
  deleteContactMessage,
  getContactMessages,
} from "@/lib/services/contact-service";
import { logger } from "@/lib/core/logger";

// GET /api/admin/messages - List all contact messages
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const messages = getContactMessages();

    return NextResponse.json({ messages });
  } catch (error) {
    logger.error("Error fetching contact messages", { error: error });
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

    deleteContactMessage(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting contact message", { error: error });
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}