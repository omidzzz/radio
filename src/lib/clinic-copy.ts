import { getDictionary, type Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { TreatmentCatalog } from "@/lib/services/treatment-catalog";
import { getWorkingHoursSummary } from "@/lib/services/working-hours";

export interface ClinicCopy {
  atlas: TreatmentCatalog;
  journey: Dictionary["services"]["journey"];
  hours: { heading: string; days: string; hours: string; zone: string };
}

export function defaultClinicCopy(locale: Locale): ClinicCopy {
  const dict = getDictionary(locale);
  return {
    atlas: dict.services.catalog,
    journey: dict.services.journey,
    hours: { ...getWorkingHoursSummary(locale), heading: dict.footer.officeHours, zone: dict.footer.tehranTime },
  };
}