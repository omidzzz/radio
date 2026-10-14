import fa from "./dictionaries/fa";
import en from "./dictionaries/en";
import type { Locale } from "./config";
import { formatDate, formatDateTime, formatShortDate, formatRelativeTime } from "./dates";

export const dictionaries = {
  fa,
  en,
} as const;

export type Dictionary = typeof fa;
export type DictionaryKey = keyof Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || fa;
}

export function getCategoryLabel(
  category: string,
  dict: Dictionary
): string {
  const labels: Record<string, string> = {
    general: dict.forum.categories.general,
    treatment: dict.forum.categories.treatment,
    support: dict.forum.categories.support,
    other: dict.forum.categories.other,
  };
  return labels[category] || category;
}

export function getSessionTypeLabel(
  type: string,
  dict: Dictionary
): string {
  const labels: Record<string, string> = {
    "initial-consultation": dict.booking.sessionTypes["initial-consultation"],
    "treatment-planning": dict.booking.sessionTypes["treatment-planning"],
    "radiation-therapy": dict.booking.sessionTypes["radiation-therapy"],
    "follow-up": dict.booking.sessionTypes["follow-up"],
    "second-opinion": dict.booking.sessionTypes["second-opinion"],
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string, dict: Dictionary): string {
  const labels: Record<string, string> = {
    pending: dict.admin.status.pending,
    confirmed: dict.admin.status.confirmed,
    cancelled: dict.admin.status.cancelled,
    completed: dict.admin.status.completed,
  };
  return labels[status] || status;
}

export { formatDate, formatDateTime, formatShortDate, formatRelativeTime };
