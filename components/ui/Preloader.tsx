"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { toFarsiDigits } from "@/lib/i18n/numbers";

const SEEN_KEY = "preloader-seen";

export default function Preloader() {
  // Show only on the first visit of a browser session — repeat navigations
  // skip straight to content, protecting LCP and avoiding annoyance.
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { locale } = useLocale();

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = sessionStorage.getItem(SEEN_KEY);
    } catch {
      // Storage unavailable (private mode etc.) — show the preloader once
    }
    if (seen) return;

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Ignore write failures
    }

    setVisible(true);

    // Animate dose bar 0 → 100 over ~900ms
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // Brief hold, then fade out
        setTimeout(() => setVisible(false), 250);
      }
    };

    // Respect reduced motion — skip straight to done
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(100);
      setTimeout(() => setVisible(false), 150);
      return;
    }

    requestAnimationFrame(tick);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Gantry ring spinner */}
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40 [animation-duration:1.2s]" />
        <div className="absolute inset-3 rounded-full border border-primary/30" />
        <div className="absolute inset-6 rounded-full border border-secondary/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-highlight shadow-sm" />
        </div>
      </div>

      {/* Brand */}
      <div className="mt-6 text-lg font-bold tracking-tight text-white">
        کلینیک پرتودرمانی
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/70">
        Radiotherapy Clinic
      </div>

      {/* Dose bar */}
      <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-widest text-primary/60">
        {locale === "fa" ? toFarsiDigits(progress) : progress}%
      </div>
    </div>
  );
}