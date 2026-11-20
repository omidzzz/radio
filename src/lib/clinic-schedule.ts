import schedule from "../../api/clinic-schedule.json";

export const clinicSchedule = schedule;
export const hoursRange = `${schedule.opens}–${schedule.closes}`;
export const dayNames = {
  fa: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: schedule.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function clinicClock(now = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(now).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function weekday(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return -1;
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date ? d.getUTCDay() : -1;
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface DaySlot {
  day_of_week: number;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

/** An administrator may narrow a clinic day or close it, never expand it. */
export function effectiveDaySlot(slot: DaySlot): DaySlot {
  const { day_of_week, start_time, end_time } = slot;
  const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (schedule.weekdays.includes(day_of_week) && slot.is_available === 1 && start_time && end_time && validTime.test(start_time) && validTime.test(end_time)) {
    const start = start_time < schedule.opens ? schedule.opens : start_time;
    const end = end_time > schedule.closes ? schedule.closes : end_time;
    if (start < end) return { day_of_week, is_available: 1, start_time: start, end_time: end };
  }
  return { day_of_week, is_available: 0, start_time: null, end_time: null };
}

export const defaultDaySlots = dayNames.en.map((_, day_of_week) => effectiveDaySlot({
  day_of_week, is_available: 1, start_time: schedule.opens, end_time: schedule.closes,
}));

export interface BookingSchedule {
  first_available_date: string;
  booking_window_days: number;
  slot_duration_minutes: number;
}

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

/** Return candidate starts; availability endpoints must additionally subtract booked/blocked slots. */
export function scheduledStarts(date: string, settings: BookingSchedule, week: DaySlot[], now = new Date()): string[] {
  const today = clinicClock(now);
  const day = weekday(date);
  const { first_available_date, booking_window_days: window, slot_duration_minutes: duration } = settings;
  if (day < 0 || !Number.isInteger(window) || window < 1 || window > 365 || !Number.isInteger(duration) || duration <= 0 ||
      date < today.date || date < first_available_date || date > addDays(today.date, window)) return [];
  const row = week.find(s => s.day_of_week === day);
  if (!row) return [];
  const { start_time, end_time } = effectiveDaySlot(row);
  if (!start_time || !end_time) return [];
  const starts: string[] = [];
  for (let m = minutes(start_time); m + duration <= minutes(end_time); m += duration) {
    const t = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    if (date !== today.date || t > today.time) starts.push(t);
  }
  return starts;
}