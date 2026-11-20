"use client";

import { useEffect, useState } from "react";
import { isClinicOpen } from "@/lib/services/working-hours";

/** Static exports must not announce a status frozen at build time. */
export default function OfficeStatus({ open, closed, className = "" }: { open: string; closed: string; className?: string }) {
  const [status, setStatus] = useState<boolean | null>(null);
  useEffect(() => {
    const refresh = () => setStatus(isClinicOpen());
    refresh();
    const timer = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  if (status === null) return null;
  return <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${status ? "bg-emerald-500" : "bg-slate-400"}`} />{status ? open : closed}</span>;
}