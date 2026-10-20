import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import {
  findBookingsByContact,
  generateBookingIcs,
} from "@/lib/services/booking-service";
import { ApiError, withErrorHandling } from "@/lib/http/api-error";

/**
 * GET /api/bookings/status?email=...&phone=...
 *   Public "check my booking" lookup. Requires BOTH email and phone to
 *   match so neither field alone can enumerate bookings.
 *
 * GET /api/bookings/status?email=...&phone=...&id=123&format=ics
 *   Download the appointment as an .ics calendar file.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limit: 10 lookups per 15 minutes per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(`status:${ip}`, {
    windowMs: 15 * 60_000,
    max: 10,
  });
  if (!rateLimit.success) {
    throw ApiError.tooManyRequests(
      "Too many lookups. Please try again later.",
      rateLimit.retryAfterSeconds
    );
  }

  const email = sanitizeText(
    request.nextUrl.searchParams.get("email") ?? ""
  ).slice(0, 200);
  const phone = sanitizeText(
    request.nextUrl.searchParams.get("phone") ?? ""
  ).slice(0, 30);

  if (!email || !phone) {
    throw ApiError.badRequest("Both email and phone are required.");
  }

  const bookings = findBookingsByContact(email, phone);

  const idParam = request.nextUrl.searchParams.get("id");
  const format = request.nextUrl.searchParams.get("format");

  if (format === "ics" && idParam) {
    const booking = bookings.find((b) => b.id === Number(idParam));
    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }
    return new NextResponse(generateBookingIcs(booking), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="appointment-${booking.id}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    {
      message: bookings.length ? "Bookings found" : "No bookings found",
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        session_type: b.session_type,
        preferred_date: b.preferred_date,
        preferred_time: b.preferred_time,
        status: b.status,
        created_at: b.created_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});