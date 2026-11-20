import { clinicClock, clinicSchedule, dayNames, hoursRange, weekday } from "@/lib/clinic-schedule";
import type { Locale } from "@/lib/i18n/config";

export function getWorkingHoursSummary(locale: Locale = "en") {
  return {
    days: clinicSchedule.weekdays.map(day => dayNames[locale][day]).join(locale === "fa" ? "، " : ", "),
    hours: hoursRange,
  };
}

export function isClinicOpen(now = new Date()) {
  const { date, time } = clinicClock(now);
  return clinicSchedule.weekdays.includes(weekday(date)) && time >= clinicSchedule.opens && time < clinicSchedule.closes;
}