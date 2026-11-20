"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";
import type { FloatingContactLabels } from "@/components/feedback/FloatingContact";

// Client-only, code-split: the floating contact widget is interactive
// chrome, not critical content — defer its JS until after hydration.
const FloatingContact = dynamic(() => import("@/components/feedback/FloatingContact"), {
  ssr: false,
});

export default function FloatingContactLazy({
  labels,
  locale,
}: {
  labels: FloatingContactLabels;
  locale: Locale;
}) {
  return <FloatingContact labels={labels} locale={locale} />;
}