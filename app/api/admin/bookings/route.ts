import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import { Booking } from "@/lib/types";
import {
  deleteBooking,
  getBookings,
  updateBookingStatus,
} from "@/lib/services/booking-service";
import { logger } from "@/lib/core/logger";

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
    const bookings = getBookings() as Booking[];

    return NextResponse.json({ bookings });
  } catch (error) {
    logger.error("Error fetching bookings", { error: error });
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

    const updated = updateBookingStatus(body.id, body.status);

    return NextResponse.json({
      booking: updated,
      statusLabel: getStatusLabel(body.status),
    });
  } catch (error) {
    logger.error("Error updating booking", { error: error });
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

    deleteBooking(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting booking", { error: error });
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}