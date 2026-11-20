"use client";

import type { Locale } from "@/lib/i18n/config";
import { useClinicCopy } from "@/components/providers/ClinicCopyProvider";
import { getWorkingHoursSummary } from "@/lib/services/working-hours";

export default function OfficeHours({ locale, className = "" }: { locale: Locale; className?: string }) {
  const { days, hours } = useClinicCopy(locale)?.hours ?? getWorkingHoursSummary(locale);
  return (
    <dl className={className} data-office-hours="">
      <dt>{days}</dt>
      <dd className="font-medium"><bdi dir="ltr">{hours}</bdi></dd>
    </dl>
  );
}