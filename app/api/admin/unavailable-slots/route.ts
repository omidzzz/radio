import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import {
  getUnavailableSlots,
  addUnavailableSlot,
  removeUnavailableSlot,
} from "@/lib/services/unavailable-slots";

// GET /api/admin/unavailable-slots - List all blocked time slots
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const slots = getUnavailableSlots();
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching unavailable slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch unavailable slots" },
      { status: 500 }
    );
  }
}

// POST /api/admin/unavailable-slots - Block a specific time slot
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      date: string;
      time: string;
      reason?: string;
    };

    if (!body.date || !body.time) {
      return NextResponse.json(
        { error: "Date and time are required" },
        { status: 400 }
      );
    }

    const slot = addUnavailableSlot({
      date: body.date,
      time: body.time,
      reason: body.reason,
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error("Error adding unavailable slot:", error);
    const message =
      error instanceof Error ? error.message : "Failed to block time slot";
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/admin/unavailable-slots?id=123 - Unblock a time slot
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Slot id is required" },
        { status: 400 }
      );
    }

    removeUnavailableSlot(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing unavailable slot:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove time slot";
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
