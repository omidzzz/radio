"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeDirs } from "@/lib/i18n/config";

export default function LocaleDirSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname.split("/")[1];
    if (locale === "fa" || locale === "en") {
      document.documentElement.dir = localeDirs[locale];
      document.documentElement.lang = locale;
    }
  }, [pathname]);

  return null;
}