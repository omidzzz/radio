import { getAvailability, DaySlot } from "./availability-service";
import { toFarsiDigits } from "@/lib/i18n/numbers";

export interface WorkingHoursEntry {
  dayLabel: string;
  hours: string;
  isClosed: boolean;
}

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// FA week starts Saturday (شنبه), then Sunday (یکشنبه) ... Friday (جمعه)
const DAY_NAMES_FA_BY_INDEX = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
// FA display order: Saturday(6) → Sunday(0) → ... → Thursday(4) → Friday(5)
const FA_ORDER = [6, 0, 1, 2, 3, 4, 5];

function to12Hour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function to12HourFa(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "بعد از ظهر" : "صبح";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${toFarsiDigits(hour12)}:${toFarsiDigits(String(m).padStart(2, "0"))} ${period}`;
}

export function getWorkingHours(locale: string = "en"): WorkingHoursEntry[] {
  const { daySlots } = getAvailability();
  const isFa = locale === "fa";

  const byDay = new Map<number, DaySlot>();
  for (const slot of daySlots) {
    byDay.set(slot.day_of_week, slot);
  }

  // Order days Saturday-first for both locales so summaries read consistently:
  // "شنبه تا پنجشنبه" / "Saturday – Thursday" working + "جمعه" / "Friday" closed
  const order = FA_ORDER;

  return order.map((dayOfWeek) => {
    const slot = byDay.get(dayOfWeek);
    const dayLabel = isFa
      ? DAY_NAMES_FA_BY_INDEX[dayOfWeek] || `روز ${toFarsiDigits(dayOfWeek)}`
      : DAY_NAMES_EN[dayOfWeek] || `Day ${dayOfWeek}`;
    if (!slot || slot.is_available !== 1 || !slot.start_time || !slot.end_time) {
      return { dayLabel, hours: "", isClosed: true };
    }
    const hours = isFa
      ? `${to12HourFa(slot.start_time)} – ${to12HourFa(slot.end_time)}`
      : `${to12Hour(slot.start_time)} – ${to12Hour(slot.end_time)}`;
    return { dayLabel, hours, isClosed: false };
  });
}

/**
 * Live "open now" status computed against the clinic's timezone (Asia/Tehran).
 * Uses the same day-slot data that powers the booking system.
 */
export function getOpenNowStatus(): { isOpen: boolean } {
  const { daySlots } = getAvailability();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[get("weekday")] ?? -1;
  const hour = parseInt(get("hour"), 10) % 24; // guard against "24" from hour12:false
  const minute = parseInt(get("minute"), 10);
  if (dayOfWeek < 0 || isNaN(hour) || isNaN(minute)) return { isOpen: false };

  const nowMinutes = hour * 60 + minute;
  const slot = daySlots.find((s) => s.day_of_week === dayOfWeek);
  if (!slot || slot.is_available !== 1 || !slot.start_time || !slot.end_time) {
    return { isOpen: false };
  }

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  return {
    isOpen:
      nowMinutes >= toMinutes(slot.start_time) &&
      nowMinutes < toMinutes(slot.end_time),
  };
}

export function getWorkingHoursSummary(locale: string = "en"): {
  label: string;
  hours: string;
  isClosed: boolean;
}[] {
  const entries = getWorkingHours(locale);
  const groups: { label: string; hours: string; isClosed: boolean }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    let end = i;
    while (
      end + 1 < entries.length &&
      entries[end + 1].hours === current.hours &&
      entries[end + 1].isClosed === current.isClosed
    ) {
      end++;
    }

    let label: string;
    if (end === i) {
      label = current.dayLabel;
    } else if (end === i + 1) {
      label = `${current.dayLabel} & ${entries[end].dayLabel}`;
    } else {
      label = `${current.dayLabel} – ${entries[end].dayLabel}`;
    }

    groups.push({ label, hours: current.hours, isClosed: current.isClosed });
    i = end;
  }

  return groups;
}