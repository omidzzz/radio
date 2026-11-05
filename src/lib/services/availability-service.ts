import db from "@/lib/db/db";
import { ApiError } from "@/lib/http/api-error";
import { isSlotUnavailable } from "./unavailable-slots";

export interface DaySlot {
  day_of_week: number;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

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

const DEFAULT_DAY_SLOTS: DaySlot[] = [
  // Sunday (یکشنبه) through Thursday (پنجشنبه) = working days → "شنبه تا پنجشنبه"
  { day_of_week: 0, is_available: 1, start_time: "08:00", end_time: "17:00" },
  { day_of_week: 1, is_available: 1, start_time: "08:00", end_time: "17:00" },
  { day_of_week: 2, is_available: 1, start_time: "08:00", end_time: "17:00" },
  { day_of_week: 3, is_available: 1, start_time: "08:00", end_time: "17:00" },
  { day_of_week: 4, is_available: 1, start_time: "08:00", end_time: "17:00" },
  // Friday (جمعه) = closed
  { day_of_week: 5, is_available: 0, start_time: null, end_time: null },
  // Saturday (شنبه) = working day → part of "شنبه تا پنجشنبه"
  { day_of_week: 6, is_available: 1, start_time: "08:00", end_time: "17:00" },
];

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
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
    ).run(todayISO());
  }

  const daySlotsCount = db
    .prepare("SELECT COUNT(*) as count FROM availability_day_slots")
    .get() as { count: number };
  if (daySlotsCount.count === 0) {
    const insert = db.prepare(
      `INSERT INTO availability_day_slots (day_of_week, is_available, start_time, end_time)
       VALUES (?, ?, ?, ?)`
    );
    for (const slot of DEFAULT_DAY_SLOTS) {
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
  return { settings, daySlots };
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
  if (dayOfWeek < 0 || dayOfWeek > 6) {
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const date = new Date(dateStr + "T12:00:00");
  if (isNaN(date.getTime())) return false;

  const firstDate = new Date(settings.first_available_date + "T12:00:00");
  if (date < firstDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + settings.booking_window_days);
  if (date > maxDate) return false;

  const dayOfWeek = date.getDay();
  const daySlot = daySlots.find((s) => s.day_of_week === dayOfWeek);
  if (!daySlot || daySlot.is_available !== 1) return false;

  return true;
}

export function getAvailableTimeSlots(dateStr: string): string[] {
  const { settings, daySlots } = getAvailability();
  if (!isDateAvailable(dateStr)) return [];

  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.getDay();
  const daySlot = daySlots.find((s) => s.day_of_week === dayOfWeek);
  if (!daySlot || daySlot.is_available !== 1 || !daySlot.start_time || !daySlot.end_time) {
    return [];
  }

  const slotDuration = settings.slot_duration_minutes;
  const [startHour, startMin] = daySlot.start_time.split(":").map(Number);
  const [endHour, endMin] = daySlot.end_time.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const slots: string[] = [];
  for (let t = startMinutes; t + slotDuration <= endMinutes; t += slotDuration) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  // Filter out past times for today and any blocked slots
  let filtered = slots;
  if (dateStr === todayISO()) {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    filtered = filtered.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m > nowMinutes;
    });
  }

  // Remove any slots that have been explicitly blocked
  filtered = filtered.filter((slot) => !isSlotUnavailable(dateStr, slot));

  return filtered;
}

export function validateBookingAvailability(dateStr: string, timeStr: string): void {
  if (!isDateAvailable(dateStr)) {
    throw ApiError.badRequest(
      "The selected date is not available for booking. Please choose another date."
    );
  }
  if (isSlotUnavailable(dateStr, timeStr)) {
    throw ApiError.badRequest(
      "The selected time slot is not available. Please choose a different time."
    );
  }
  const slots = getAvailableTimeSlots(dateStr);
  if (!slots.includes(timeStr)) {
    throw ApiError.badRequest(
      "The selected time is not available. Please choose an available time slot."
    );
  }
}
