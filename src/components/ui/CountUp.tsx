"use client";

import { memo, useEffect, useRef, useState } from "react";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** Convert rendered digits to Farsi numerals (Persian locale) */
  useFarsiDigits?: boolean;
}

export default memo(function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  useFarsiDigits = false,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / (duration * 1000), 1);
              const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              setValue(end * eased);

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setValue(end);
              }
            };

            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const display = useFarsiDigits ? toFarsiDigits(formatted) : formatted;

  return (
    <span ref={ref} className={["tnum", className].filter(Boolean).join(" ")}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
});