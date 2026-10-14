import db from "@/lib/db";
import { BookingFormValues } from "@/lib/validation/booking";
import { ApiError } from "@/lib/api-error";
import { notifyNewBooking } from "@/lib/mailer";

export interface BookingRecord {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export function createBooking(input: BookingFormValues) {
  const result = db
    .prepare(
      `INSERT INTO bookings (full_name, email, phone, session_type, preferred_date, preferred_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.full_name,
      input.email,
      input.phone,
      input.session_type,
      input.preferred_date,
      input.preferred_time,
      input.notes || null
    );

  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(result.lastInsertRowid);

  if (!booking) {
    throw ApiError.internal("Failed to retrieve created booking");
  }

  // Fire-and-forget email notification to the clinic (logged when mail
  // is not configured). Never blocks or fails the request itself.
  notifyNewBooking(booking as unknown as Parameters<typeof notifyNewBooking>[0]);

  return booking;
}

/**
 * Look up bookings by matching BOTH email and phone — used by the public
 * "check my booking" feature so no single field alone can enumerate data.
 */
export function findBookingsByContact(
  email: string,
  phone: string
): BookingRecord[] {
  return db
    .prepare(
      `SELECT id, full_name, email, phone, session_type, preferred_date,
              preferred_time, notes, status, created_at
       FROM bookings
       WHERE lower(email) = lower(?) AND phone = ?
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all(email.trim(), phone.trim()) as BookingRecord[];
}

/**
 * Generate an iCalendar (.ics) file body for a confirmed/pending booking.
 */
export function generateBookingIcs(booking: BookingRecord): string {
  const [y, m, d] = booking.preferred_date.split("-").map(Number);
  const [hh, mm] = booking.preferred_time.split(":").map(Number);
  // Assume clinic-local time; format as floating local time (no TZ suffix)
  const start = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}00`;
  const endHhMm = `${String(Math.min(hh + 1, 23)).padStart(2, "0")}${String(mm).padStart(2, "0")}`;
  const end = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}T${endHhMm}00`;
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  // RFC 5545 requires CRLF line endings
  const CRLF = String.fromCharCode(13, 10);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Radiotherapy Clinic//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@radiotherapyclinic`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Clinic appointment #${booking.id}`,
    `DESCRIPTION:Session type: ${booking.session_type}. Status: ${booking.status}.`,
    "LOCATION:Radiotherapy Clinic",
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join(CRLF);
}

export function getBookings() {
  return db
    .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
    .all();
}

export function updateBookingStatus(id: number, status: string) {
  const result = db
    .prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    throw ApiError.notFound("Booking not found");
  }

  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
}

export function deleteBooking(id: number) {
  const result = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw ApiError.notFound("Booking not found");
  }
  return result;
}