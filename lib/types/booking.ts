/**
 * Booking domain types.
 *
 * `BookingRow` mirrors the SQLite columns; `Booking` is the canonical model.
 * Both are snake_case because the booking workflow is field-for-field with
 * the `bookings` table and the admin CSV export relies on those names.
 */

/** Raw `bookings` table row. */
export interface BookingRow {
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

/** Canonical booking model. */
export interface Booking {
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

/** Payload for creating a new booking. */
export interface NewBookingInput {
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
}

/** Valid booking lifecycle states. */
export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];