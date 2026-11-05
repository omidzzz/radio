import type { BookingRow } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { logger } from "@/lib/core/logger";

/**
 * Repository for the bookings table.
 */
export class BookingRepository extends BaseRepository<BookingRow> {
  constructor() {
    super("bookings");
  }

  /** Find bookings by matching both email and phone. */
  findByContact(email: string, phone: string): BookingRow[] {
    try {
      return this.prepareStmt(
        `SELECT * FROM bookings
         WHERE lower(email) = lower(?) AND phone = ?
         ORDER BY created_at DESC
         LIMIT 20`
      ).all(email.trim(), phone.trim()) as BookingRow[];
    } catch (error) {
      logger.error("BookingRepository.findByContact failed", { error, email, phone });
      throw error;
    }
  }

  /** Create a booking. */
  create(data: Record<string, unknown>): BookingRow {
    try {
      const result = this.prepareStmt(
        `INSERT INTO bookings (full_name, email, phone, session_type, preferred_date, preferred_time, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        data.full_name,
        data.email,
        data.phone,
        data.session_type,
        data.preferred_date,
        data.preferred_time,
        data.notes ?? null
      );

      const booking = this.prepareStmt(
        "SELECT * FROM bookings WHERE id = ?"
      ).get(result.lastInsertRowid) as BookingRow | undefined;

      if (!booking) throw new Error("Failed to retrieve created booking");

      return booking;
    } catch (error) {
      logger.error("BookingRepository.create failed", { error, data });
      throw error;
    }
  }

  /** Update booking status. */
  updateStatus(id: number, status: string): BookingRow {
    const result = this.prepareStmt(
      "UPDATE bookings SET status = ? WHERE id = ?"
    ).run(status, id);

    if (result.changes === 0) {
      throw new Error(`Booking ${id} not found`);
    }

    const updated = this.findById(id);
    if (!updated) throw new Error(`Booking ${id} not found after update`);

    return updated;
  }

  /** Delete a booking. */
  delete(id: number): boolean {
    const result = super.delete(id);
    if (!result) {
      throw new Error(`Booking ${id} not found`);
    }
    return result;
  }

  /** List all bookings (admin). */
  listAll(): BookingRow[] {
    return this.prepareStmt(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    ).all() as BookingRow[];
  }
}

export const bookingRepository = new BookingRepository();