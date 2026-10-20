import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminWithCsrf } from "@/lib/security/auth";
import {
  getAvailability,
  updateAvailabilitySettings,
  updateDaySlot,
} from "@/lib/services/availability-service";

// GET /api/admin/availability - Get current availability settings
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const data = getAvailability();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/availability - Update availability settings
export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminWithCsrf(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      first_available_date?: string;
      booking_window_days?: number;
      slot_duration_minutes?: number;
      day_of_week?: number;
      is_available?: number;
      start_time?: string | null;
      end_time?: string | null;
    };

    // If day_of_week is provided, update a specific day slot
    if (body.day_of_week !== undefined) {
      const daySlot = updateDaySlot(body.day_of_week, {
        is_available: body.is_available,
        start_time: body.start_time,
        end_time: body.end_time,
      });
      return NextResponse.json({ daySlot });
    }

    // Otherwise update global settings
    const settings = updateAvailabilitySettings({
      first_available_date: body.first_available_date,
      booking_window_days: body.booking_window_days,
      slot_duration_minutes: body.slot_duration_minutes,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating availability:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update availability settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}