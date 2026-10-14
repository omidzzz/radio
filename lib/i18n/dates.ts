import { Locale } from "./config";
import { toFarsiDigits } from "./numbers";

/**
 * Format a date according to locale.
 * For Farsi (fa): Uses the Jalali (Persian) calendar with Farsi digits.
 * For English (en): Uses the Gregorian calendar.
 */
export function formatDate(
  date: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (locale === "fa") {
    // Use Persian calendar with Farsi digits
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }).format(d);
    return toFarsiDigits(formatted);
  }

  // English (Gregorian)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Format a date with time according to locale.
 */
export function formatDateTime(
  date: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (locale === "fa") {
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }).format(d);
    return toFarsiDigits(formatted);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
}

/**
 * Format a date in short form (e.g., ۱۴۰۳/۵/۲۰ or 8/11/2026).
 */
export function formatShortDate(
  date: string | Date,
  locale: Locale
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  if (locale === "fa") {
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(d);
    return toFarsiDigits(formatted);
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Format relative time (e.g., "3 days ago") in the given locale.
 */
export function formatRelativeTime(
  date: string | Date,
  locale: Locale
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const rtf = new Intl.RelativeTimeFormat(locale === "fa" ? "fa" : "en", {
    numeric: "auto",
  });

  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  if (Math.abs(diffYear) >= 1) return rtf.format(diffYear, "year");
  if (Math.abs(diffMonth) >= 1) return rtf.format(diffMonth, "month");
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, "hour");
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");
  return rtf.format(diffSec, "second");
}