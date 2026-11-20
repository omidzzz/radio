import db from "@/lib/db/db";
import { ApiError } from "@/lib/http/api-error";
import { getUnavailableSlotsForDate } from "./unavailable-slots";
import { clinicClock, clinicSchedule, defaultDaySlots, effectiveDaySlot, scheduledStarts, type DaySlot } from "@/lib/clinic-schedule";
export type { DaySlot } from "@/lib/clinic-schedule";

export interface AvailabilitySettings {
  id: number;
  first_available_date: string;
  booking_window_days: number;
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityData {
  settings: AvailabilitySettings;
  daySlots: DaySlot[];
}

function ensureTables() {
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

export function getAvailability(): AvailabilityData {
  ensureTables();
  const settings = db
    .prepare("SELECT * FROM availability_settings WHERE id = 1")
    .get() as AvailabilitySettings;
  const daySlots = db
    .prepare("SELECT * FROM availability_day_slots ORDER BY day_of_week")
    .all() as DaySlot[];
  return { settings, daySlots: daySlots.map(effectiveDaySlot) };
}

export function updateAvailabilitySettings(input: {
  first_available_date?: string;
  booking_window_days?: number;
  slot_duration_minutes?: number;
}): AvailabilitySettings {
  ensureTables();
  const current = getAvailability().settings;
  const first_available_date = input.first_available_date ?? current.first_available_date;
  const booking_window_days = input.booking_window_days ?? current.booking_window_days;
  const slot_duration_minutes = input.slot_duration_minutes ?? current.slot_duration_minutes;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(first_available_date)) {
    throw ApiError.badRequest("Invalid first available date format. Use YYYY-MM-DD.");
  }
  if (booking_window_days < 1 || booking_window_days > 365) {
    throw ApiError.badRequest("Booking window must be between 1 and 365 days.");
  }
  if (slot_duration_minutes < 10 || slot_duration_minutes > 240) {
    throw ApiError.badRequest("Slot duration must be between 10 and 240 minutes.");
  }

  db.prepare(
    `UPDATE availability_settings
     SET first_available_date = ?, booking_window_days = ?, slot_duration_minutes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run(first_available_date, booking_window_days, slot_duration_minutes);

  return getAvailability().settings;
}

export function updateDaySlot(
  dayOfWeek: number,
  input: {
    is_available?: number;
    start_time?: string | null;
    end_time?: string | null;
  }
): DaySlot {
  ensureTables();
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw ApiError.badRequest("Day of week must be between 0 (Sunday) and 6 (Saturday).");
  }

  const current = getAvailability().daySlots.find((s) => s.day_of_week === dayOfWeek);
  if (!current) {
    throw ApiError.notFound("Day slot not found");
  }

  const is_available = input.is_available !== undefined ? input.is_available : current.is_available;
  let start_time = input.start_time !== undefined ? input.start_time : current.start_time;
  let end_time = input.end_time !== undefined ? input.end_time : current.end_time;

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (start_time && !timeRegex.test(start_time)) {
    throw ApiError.badRequest("Invalid start time format. Use HH:MM (24-hour).");
  }
  if (end_time && !timeRegex.test(end_time)) {
    throw ApiError.badRequest("Invalid end time format. Use HH:MM (24-hour).");
  }

  if (is_available === 1) {
    if (!start_time || !end_time) {
      throw ApiError.badRequest("Start and end times are required for available days.");
    }
    if (!clinicSchedule.weekdays.includes(dayOfWeek) || start_time < clinicSchedule.opens || end_time > clinicSchedule.closes) {
      throw ApiError.badRequest("Weekly availability must stay within clinic hours.");
    }
    if (start_time >= end_time) {
      throw ApiError.badRequest("Start time must be before end time.");
    }
  } else {
    start_time = null;
    end_time = null;
  }

  db.prepare(
    `UPDATE availability_day_slots
     SET is_available = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
     WHERE day_of_week = ?`
  ).run(is_available, start_time, end_time, dayOfWeek);

  return getAvailability().daySlots.find((s) => s.day_of_week === dayOfWeek)!;
}

export function isDateAvailable(dateStr: string): boolean {
  const { settings, daySlots } = getAvailability();
  return scheduledStarts(dateStr, settings, daySlots).length > 0;
}

export function getAvailableTimeSlots(dateStr: string): string[] {
  const { settings, daySlots } = getAvailability();
  const starts = scheduledStarts(dateStr, settings, daySlots);
  if (!starts.length) return [];
  const taken = new Set(getUnavailableSlotsForDate(dateStr).map(row => row.time.slice(0, 5)));
  const booked = db.prepare("SELECT preferred_time FROM bookings WHERE preferred_date = ? AND status != 'cancelled'").pluck().all(dateStr) as string[];
  booked.forEach(time => taken.add(time.slice(0, 5)));
  return starts.filter(time => !taken.has(time));
}

export function validateBookingAvailability(dateStr: string, timeStr: string): void {
  const slots = getAvailableTimeSlots(dateStr);
  if (!slots.includes(timeStr)) {
    throw ApiError.badRequest(
      "The selected time is not available. Please choose an available time slot."
    );
  }
}
