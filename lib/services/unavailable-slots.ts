import db from "@/lib/db";
import { ApiError } from "@/lib/api-error";

export interface UnavailableSlot {
  id: number;
  date: string;
  time: string;
  reason: string | null;
  created_at: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function ensureTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS unavailable_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, time)
    );
    CREATE INDEX IF NOT EXISTS idx_unavailable_date ON unavailable_slots(date);
  `);
}

/**
 * Get all blocked (unavailable) time slots, ordered by date then time.
 */
export function getUnavailableSlots(): UnavailableSlot[] {
  ensureTable();
  return db
    .prepare(
      "SELECT id, date, time, reason, created_at FROM unavailable_slots ORDER BY date ASC, time ASC"
    )
    .all() as UnavailableSlot[];
}

/**
 * Get all blocked slots for a specific date.
 */
export function getUnavailableSlotsForDate(date: string): UnavailableSlot[] {
  if (!DATE_REGEX.test(date)) {
    throw ApiError.badRequest("Invalid date format. Use YYYY-MM-DD.");
  }
  ensureTable();
  return db
    .prepare(
      "SELECT id, date, time, reason, created_at FROM unavailable_slots WHERE date = ? ORDER BY time ASC"
    )
    .all(date) as UnavailableSlot[];
}

/**
 * Check whether a specific date+time slot is blocked.
 */
export function isSlotUnavailable(date: string, time: string): boolean {
  if (!DATE_REGEX.test(date) || !TIME_REGEX.test(time)) return false;
  ensureTable();
  const row = db
    .prepare("SELECT 1 FROM unavailable_slots WHERE date = ? AND time = ? LIMIT 1")
    .get(date, time) as { "1": number } | undefined;
  return !!row;
}

/**
 * Block a specific date+time slot.
 */
export function addUnavailableSlot(input: {
  date: string;
  time: string;
  reason?: string | null;
}): UnavailableSlot {
  if (!DATE_REGEX.test(input.date)) {
    throw ApiError.badRequest("Invalid date format. Use YYYY-MM-DD.");
  }
  if (!TIME_REGEX.test(input.time)) {
    throw ApiError.badRequest("Invalid time format. Use HH:MM (24-hour).");
  }

  ensureTable();

  const reason = input.reason?.trim() || null;

  try {
    const info = db
      .prepare(
        "INSERT INTO unavailable_slots (date, time, reason) VALUES (?, ?, ?)"
      )
      .run(input.date, input.time, reason);

    return db
      .prepare(
        "SELECT id, date, time, reason, created_at FROM unavailable_slots WHERE id = ?"
      )
      .get(info.lastInsertRowid) as UnavailableSlot;
  } catch (err: unknown) {
    // SQLite UNIQUE constraint violation
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "SQLITE_CONSTRAINT"
    ) {
      throw ApiError.badRequest(
        "This time slot is already blocked. Choose a different date and time."
      );
    }
    throw err;
  }
}

/**
 * Remove a blocked time slot by id.
 */
export function removeUnavailableSlot(id: number): void {
  ensureTable();
  const info = db
    .prepare("DELETE FROM unavailable_slots WHERE id = ?")
    .run(id);

  if (info.changes === 0) {
    throw ApiError.notFound("Unavailable slot not found.");
  }
}
