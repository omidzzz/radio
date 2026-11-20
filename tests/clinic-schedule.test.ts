import { describe, expect, it } from "vitest";
import { addDays, clinicClock, defaultDaySlots, scheduledStarts, weekday } from "@/lib/clinic-schedule";
import { getWorkingHoursSummary, isClinicOpen } from "@/lib/services/working-hours";

const saturday = "2026-11-21";
const beforeOpening = new Date("2026-11-21T06:00:00Z");
const settings = { first_available_date: saturday, booking_window_days: 7, slot_duration_minutes: 30 };
const legacyWeek = defaultDaySlots.map(({ day_of_week }) => ({ day_of_week, is_available: 1, start_time: "08:00", end_time: "17:00" }));
const starts = (date: string, duration = 30) => scheduledStarts(date, { ...settings, slot_duration_minutes: duration }, legacyWeek, beforeOpening);

describe("clinic schedule", () => {
  it("lists only the open weekdays and their 24-hour range in each language", () => {
    expect(getWorkingHoursSummary("fa")).toEqual({ days: "شنبه، یکشنبه، سه‌شنبه", hours: "10:00–13:00" });
    expect(getWorkingHoursSummary("en")).toEqual({ days: "Saturday, Sunday, Tuesday", hours: "10:00–13:00" });
  });
  it("caps legacy rows on all seven weekdays; the last half-hour starts at 12:30", () => {
    for (let i = 0; i < 7; i++) {
      expect(starts(addDays(saturday, i))).toEqual([0, 1, 3].includes(i) ? ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"] : []);
    }
  });
  it("requires a real date within the inclusive window and a whole session before closing", () => {
    expect(weekday("2026-11-31")).toBe(-1);
    expect(starts("2026-11-20")).toEqual([]);
    expect(starts("2026-11-28")).toHaveLength(6);
    expect(starts("2026-11-29")).toEqual([]);
    expect(starts(saturday, 50)).toEqual(["10:00", "10:50", "11:40"]);
    expect(starts(saturday, 0)).toEqual([]);
  });
  it("keeps admin restrictions and the current Tehran time", () => {
    const narrow = [{ day_of_week: 6, is_available: 1, start_time: "11:00", end_time: "12:30" }];
    expect(scheduledStarts(saturday, settings, narrow, new Date("2026-11-21T07:30:00Z"))).toEqual(["11:30", "12:00"]);
    expect(scheduledStarts(saturday, settings, [], beforeOpening)).toEqual([]);
    expect(clinicClock(new Date("2026-11-20T21:00:00Z"))).toEqual({ date: saturday, time: "00:30" });
    expect(isClinicOpen(new Date("2026-11-21T06:30:00Z"))).toBe(true);
    expect(isClinicOpen(new Date("2026-11-21T09:30:00Z"))).toBe(false);
    expect(isClinicOpen(new Date("2026-11-23T07:00:00Z"))).toBe(false);
  });
});