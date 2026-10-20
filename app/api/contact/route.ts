import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp, getClientIp } from "@/lib/http/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import { validateContact } from "@/lib/validation/contact";
import { createContactMessage } from "@/lib/services/contact-service";
import { notifyContactMessage } from "@/lib/mail/mailer";
import { ApiError, withErrorHandling } from "@/lib/http/api-error";

// POST /api/contact - Submit a contact message
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limit: 5 messages per hour per IP
  const ip = getClientIp(request);
  const rateLimit = rateLimitByIp(ip, { windowMs: 60 * 60_000, max: 5 });
  if (!rateLimit.success) {
    throw ApiError.tooManyRequests(
      "Too many messages. Please try again later.",
      rateLimit.retryAfterSeconds
    );
  }

  const body = await request.json();

  // Honeypot check - silently reject spam submissions
  if (body.website_field) {
    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 201 }
    );
  }

  // Validate with Zod
  const validation = validateContact(body);
  if (!validation.success) {
    throw ApiError.badRequest(validation.errors.join(", "));
  }

  // Sanitize inputs
  const input = {
    name: sanitizeText(validation.data.name).slice(0, 200),
    email: sanitizeText(validation.data.email).slice(0, 200),
    subject: sanitizeText(validation.data.subject).slice(0, 300),
    message: sanitizeText(validation.data.message).slice(0, 5000),
  };

  const message = createContactMessage(input);

  // Fire-and-forget email notification to the clinic (logged when mail
  // is not configured). Never blocks or fails the request itself.
  if (message) {
    notifyContactMessage(
      message as unknown as Parameters<typeof notifyContactMessage>[0]
    );
  }

  return NextResponse.json(
    { message: "Message sent successfully", contact: message },
    { status: 201 }
  );
});