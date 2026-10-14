import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { validateBooking } from "@/lib/validation/booking";
import { createBooking } from "@/lib/services/booking-service";
import { validateBookingAvailability } from "@/lib/services/availability-service";
import { ApiError, withErrorHandling } from "@/lib/api-error";

// POST /api/bookings - Create a new booking request
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limit: 5 bookings per hour per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 60 * 60_000, max: 5 });
  if (!rateLimit.success) {
    throw ApiError.tooManyRequests(
      "Too many booking requests. Please try again later.",
      rateLimit.retryAfterSeconds
    );
  }

  const body = await request.json();

  // Honeypot check - silently reject spam submissions
  if (body.website_field) {
    return NextResponse.json(
      { message: "Booking request submitted successfully" },
      { status: 201 }
    );
  }

  // Validate with Zod
  const validation = validateBooking(body);
  if (!validation.success) {
    throw ApiError.badRequest(validation.errors.join(", "));
  }

  // Sanitize inputs
  const input = {
    ...validation.data,
    full_name: sanitizeText(validation.data.full_name).slice(0, 200),
    email: sanitizeText(validation.data.email).slice(0, 200),
    phone: sanitizeText(validation.data.phone).slice(0, 30),
    notes: validation.data.notes
      ? sanitizeText(validation.data.notes).slice(0, 2000)
      : undefined,
  };

  // Validate that the requested date/time is within configured availability
  validateBookingAvailability(input.preferred_date, input.preferred_time);

  const booking = createBooking(input);

  return NextResponse.json(
    { message: "Booking request submitted successfully", booking },
    { status: 201 }
  );
});