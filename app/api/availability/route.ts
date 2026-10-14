import { NextRequest, NextResponse } from "next/server";
import {
  getAvailability,
  isDateAvailable,
  getAvailableTimeSlots,
} from "@/lib/services/availability-service";
import { getUnavailableSlotsForDate } from "@/lib/services/unavailable-slots";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

// GET /api/availability - Get availability config and time slots
// Query params:
//   ?date=YYYY-MM-DD  → returns available time slots for that date
//   (no params)       → returns full availability config (settings + day slots)
export async function GET(request: NextRequest) {
  // Rate limit: 60 requests per minute per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 60_000, max: 60 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const date = request.nextUrl.searchParams.get("date");

    if (date) {
      const available = isDateAvailable(date);
      const timeSlots = available ? getAvailableTimeSlots(date) : [];
      const blockedSlots = available
        ? getUnavailableSlotsForDate(date).map((s) => s.time)
        : [];
      return NextResponse.json({ date, available, timeSlots, blockedSlots });
    }

    const data = getAvailability();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
