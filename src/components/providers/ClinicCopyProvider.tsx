"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { ClinicCopy } from "@/lib/clinic-copy";

const CopyContext = createContext<{ locale: Locale; copy: Partial<ClinicCopy> } | null>(null);

export function ClinicCopyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "fa";
  const [live, setLive] = useState<{ locale: Locale; copy: Partial<ClinicCopy> } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const res = await fetch(`/api/clinic-content.php?locale=${locale}`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const value = await res.json();
        if (!controller.signal.aborted && value.locale === locale && value.copy) setLive({ locale, copy: value.copy });
      } catch { /* Keep the static fallback when the PHP backend is unavailable. */ }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); };
  }, [locale]);
  return <CopyContext.Provider value={live?.locale === locale ? live : null}>{children}</CopyContext.Provider>;
}

export function useClinicCopy(locale: Locale) {
  const live = useContext(CopyContext);
  return live?.locale === locale ? live.copy : undefined;
}

export function HoursLabel({ locale, field = "heading", fallback }: { locale: Locale; field?: "zone" | "heading"; fallback: string }) {
  return <>{useClinicCopy(locale)?.hours?.[field] ?? fallback}</>;
}