import type { DaySlot } from "@/lib/types";
import { BaseRepository } from "@/lib/db/repositories/base-repository";
import { clinicClock, defaultDaySlots, effectiveDaySlot } from "@/lib/clinic-schedule";

/**
 * Repository for availability settings and day slots.
 */
export class AvailabilityRepository extends BaseRepository<{
  id: number;
  first_available_date: string;
  booking_window_days: number;
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}> {
  constructor() {
    super("availability_settings");
  }

  /** Ensure tables exist and seed defaults if empty. */
  ensureTables(db: any): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS availability_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        first_available_date TEXT NOT NULL,
        booking_window_days INTEGER NOT NULL DEFAULT 30,
        slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS availability_day_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
        is_available INTEGER NOT NULL DEFAULT 0,
        start_time TEXT,
        end_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const settingsCount = db
      .prepare("SELECT COUNT(*) as count FROM availability_settings")
      .get() as { count: number };
    if (settingsCount.count === 0) {
      db.prepare(
        `INSERT INTO availability_settings (id, first_available_date, booking_window_days, slot_duration_minutes)
         VALUES (1, ?, 30, 30)`
      ).run(clinicClock().date);
    }

    const daySlotsCount = db
      .prepare("SELECT COUNT(*) as count FROM availability_day_slots")
      .get() as { count: number };
    if (daySlotsCount.count === 0) {
      const insert = db.prepare(
        `INSERT INTO availability_day_slots (day_of_week, is_available, start_time, end_time)
         VALUES (?, ?, ?, ?)`
      );
      for (const slot of defaultDaySlots) {
        insert.run(slot.day_of_week, slot.is_available, slot.start_time, slot.end_time);
      }
    }
  }

  /** Get availability settings. */
  getSettings(db: any) {
    return db
      .prepare("SELECT * FROM availability_settings WHERE id = 1")
      .get() as {
      id: number;
      first_available_date: string;
      booking_window_days: number;
      slot_duration_minutes: number;
      created_at: string;
      updated_at: string;
    } | undefined;
  }

  /** Get day slots. */
  getDaySlots(db: any): DaySlot[] {
    const slots = db
      .prepare("SELECT * FROM availability_day_slots ORDER BY day_of_week")
      .all() as DaySlot[];
    return slots.map(slot => ({ ...slot, ...effectiveDaySlot(slot) }));
  }

  /** Update a day slot. */
  updateDaySlot(
    db: any,
    dayOfWeek: number,
    is_available: number,
    start_time: string | null,
    end_time: string | null
  ) {
    db.prepare(
      `UPDATE availability_day_slots
       SET is_available = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
       WHERE day_of_week = ?`
    ).run(is_available, start_time, end_time, dayOfWeek);

    return this.getDaySlots(db).find((s) => s.day_of_week === dayOfWeek)!;
  }
}

export const availabilityRepository = new AvailabilityRepository();