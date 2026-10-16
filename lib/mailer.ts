import "server-only";
import { logger } from "./logger";

/**
 * Lightweight transactional email sender.
 *
 * Uses the Resend HTTP API via fetch — no extra dependencies required.
 * Configure with environment variables:
 *   - RESEND_API_KEY   (required to actually send)
 *   - MAIL_FROM        (e.g. "Clinic <bookings@yourdomain.com>")
 *   - NOTIFY_EMAIL     (clinic inbox that receives notifications)
 *
 * When not configured, emails are logged instead of sent so local
 * development and CI keep working unchanged.
 */

interface EmailPayload {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Clinic <onboarding@resend.dev>";
  const to = process.env.NOTIFY_EMAIL;

  if (!apiKey || !to) {
    logger.info(
      `[mailer] Mail not configured (set RESEND_API_KEY + NOTIFY_EMAIL). Would have sent:\n` +
        `  To: ${to ?? "(unset)"}\n  Subject: ${payload.subject}`
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error(`[mailer] Resend API error ${response.status}: ${body}`);
      return false;
    }
    return true;
  } catch (error) {
    // Never let notification failures break the user-facing request
    logger.error("[mailer] Failed to send email", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function escapeHtml(value: string): string {
  // Built from char codes so the entities survive any HTML-aware tooling
  const AMP = String.fromCharCode(38);
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const QUOT = String.fromCharCode(34);
  return value
    .replace(new RegExp(AMP, "g"), AMP + "amp;")
    .replace(new RegExp(LT, "g"), AMP + "lt;")
    .replace(new RegExp(GT, "g"), AMP + "gt;")
    .replace(new RegExp(QUOT, "g"), AMP + "quot;");
}

function renderRows(rows: [string, string][]): string {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:bold">${escapeHtml(
          label
        )}</td><td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:sans-serif;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0">
    <div style="background:#1d1a1b;color:#e5e4e2;padding:16px 24px;border-radius:12px 12px 0 0;font-weight:bold">
      ${escapeHtml(title)}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a">
      ${bodyHtml}
    </table>
  </div></body></html>`;
}

/** Notify the clinic about a new booking request. */
export function notifyNewBooking(booking: {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
}): void {
  void sendEmail({
    subject: `New booking request #${booking.id} — ${booking.full_name}`,
    replyTo: booking.email,
    html: wrapHtml(
      "New Booking Request",
      renderRows([
        ["Reference", `#${booking.id}`],
        ["Name", booking.full_name],
        ["Email", booking.email],
        ["Phone", booking.phone],
        ["Session type", booking.session_type],
        ["Preferred date", booking.preferred_date],
        ["Preferred time", booking.preferred_time],
        ...(booking.notes ? ([["Notes", booking.notes]] as [string, string][]) : []),
      ])
    ),
    text: [
      `New booking request #${booking.id}`,
      `Name: ${booking.full_name}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Session: ${booking.session_type}`,
      `When: ${booking.preferred_date} ${booking.preferred_time}`,
      booking.notes ? `Notes: ${booking.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

/** Notify the clinic about a new contact message. */
export function notifyContactMessage(message: {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
}): void {
  void sendEmail({
    subject: `Contact form: ${message.subject}`,
    replyTo: message.email,
    html: wrapHtml(
      "New Contact Message",
      renderRows([
        ["From", `${message.name} (#${message.id})`],
        ["Email", message.email],
        ["Subject", message.subject],
        ["Message", message.message],
      ])
    ),
    text: `Contact #${message.id}\nFrom: ${message.name} <${message.email}>\nSubject: ${message.subject}\n\n${message.message}`,
  });
}