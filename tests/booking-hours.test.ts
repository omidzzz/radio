import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createBooking } from "@/lib/services/booking-service";
import { getAvailability, getAvailableTimeSlots, updateDaySlot } from "@/lib/services/availability-service";
import { addUnavailableSlot } from "@/lib/services/unavailable-slots";

const db = new Database(":memory:");
vi.mock("@/lib/db/db", () => ({ get default() { return db; } }));
vi.mock("@/lib/mail/mailer", () => ({ notifyNewBooking: vi.fn() }));

describe("reservation hours with legacy SQLite rows", () => {
  const date = "2026-11-21";
  const input = { full_name: "Test Patient", email: "test@example.test", phone: "123456789", session_type: "initial-consultation" as const, preferred_date: date, preferred_time: "12:30" };
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-21T06:00:00Z"));
    db.exec("CREATE TABLE bookings(id INTEGER PRIMARY KEY,full_name TEXT,email TEXT,phone TEXT,session_type TEXT,preferred_date TEXT,preferred_time TEXT,notes TEXT,status TEXT DEFAULT 'pending')");
    getAvailability();
    db.exec("UPDATE availability_day_slots SET is_available=1,start_time='08:00',end_time='17:00'");
  });
  afterAll(() => { vi.useRealTimers(); db.close(); });

  it("rejects disallowed dates and times at insertion, not just in the calendar", () => {
    for (const [preferred_date, preferred_time] of [[date, "09:30"], [date, "10:15"], [date, "13:00"], ["2026-11-23", "10:00"], ["2026-11-27", "11:00"]]) {
      expect(() => createBooking({ ...input, preferred_date, preferred_time })).toThrow();
    }
    expect(() => updateDaySlot(1, { is_available: 1, start_time: "10:00", end_time: "13:00" })).toThrow();
    expect(db.prepare("SELECT count(*) FROM bookings").pluck().get()).toBe(0);
  });

  it("keeps both blocked and already reserved slots out of the list and rejects them on submit", () => {
    addUnavailableSlot({ date, time: "11:00" });
    expect(() => createBooking({ ...input, preferred_time: "11:00" })).toThrow();
    createBooking(input);
    expect(() => createBooking(input)).toThrow();
    expect(getAvailableTimeSlots(date)).toEqual(["10:00", "10:30", "11:30", "12:00"]);
  });
});