import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/auth";
import { Booking } from "@/lib/types";
import { statsCache } from "@/lib/cache";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  return labels[status] || status;
}

// GET /api/admin/bookings - List all bookings
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const bookings = db
      .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
      .all() as Booking[];

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/bookings - Update a booking status
export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      id?: number;
      status?: string;
    };

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Booking ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const result = db
      .prepare("UPDATE bookings SET status = ? WHERE id = ?")
      .run(body.status, body.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const updated = db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(body.id);

    // Invalidate stats cache after status change
    statsCache.clear();

    return NextResponse.json({
      booking: updated,
      statusLabel: getStatusLabel(body.status),
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bookings - Delete a booking
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const result = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Invalidate stats cache after deleting booking
    statsCache.clear();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}