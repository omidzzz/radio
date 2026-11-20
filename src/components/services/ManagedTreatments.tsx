"use client";

import { useClinicCopy } from "@/components/providers/ClinicCopyProvider";
import TreatmentAtlas from "./TreatmentAtlas";
import TreatmentJourney from "./TreatmentJourney";
import JsonLdScript from "@/components/feedback/JsonLd";
import { treatmentProcedureSchemas } from "@/lib/seo/json-ld";
import type { ClinicCopy } from "@/lib/clinic-copy";
import type { Locale } from "@/lib/i18n/config";

export default function ManagedTreatments({ locale, atlas, journey, ctaLabel }: Pick<ClinicCopy, "atlas" | "journey"> & { locale: Locale; ctaLabel: string }) {
  const copy = useClinicCopy(locale);
  const catalog = copy?.atlas ?? atlas;
  return <><JsonLdScript data={treatmentProcedureSchemas(catalog, locale)} /><TreatmentAtlas catalog={catalog} locale={locale} ctaLabel={ctaLabel} /><TreatmentJourney journey={copy?.journey ?? journey} locale={locale} /></>;
}