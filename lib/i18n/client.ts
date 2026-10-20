"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { getDictionary } from "./index";
import type { Dictionary } from "./index";
import { toFarsiDigits } from "./numbers";

export function useDictionary(): Dictionary {
  const { locale } = useLocale();
  return getDictionary(locale);
}

export function useFarsiDigits() {
  const { locale } = useLocale();
  return (value: string | number) =>
    locale === "fa" ? toFarsiDigits(value) : String(value);
}

export { getCategoryLabel, getSessionTypeLabel, getStatusLabel } from "./index";
