"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/seo/seo";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { ArrowUpIcon, ClockIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";

export interface FloatingContactLabels {
  telegram: string;
  whatsapp: string;
  backToTop: string;
  officeHours: string;
  workingDays: string;
  friday: string;
  fridayHours: string;
  openNow: string;
  closedNow: string;
}

interface FloatingContactProps {
  /** Localized labels used for tooltips and aria-labels */
  labels: FloatingContactLabels;
  /** Scroll position (px) after which the back-to-top button appears */
  showAfter?: number;
}

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Floating contact bubbles + back-to-top button with a scroll
 * progress ring.
 *
 * Performance notes:
 * - Scroll updates are rAF-throttled via the shared useScrollProgress hook.
 * - All visual updates are written directly to the DOM via refs —
 *   React state is never touched while scrolling (zero re-renders).
 * - The back-to-top button is suppressed on pages that render the
 *   reading-progress widget, which has its own back-to-top control.
 */
export default function FloatingContact({
  labels,
  showAfter = 400,
}: FloatingContactProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const [hoursOpen, setHoursOpen] = useState(false);
  // Set post-mount; false on the server so there is no hydration mismatch.
  const [readingWidgetPresent, setReadingWidgetPresent] = useState(false);
  const tehranTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "long",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const weekday = tehranTime.find((part) => part.type === "weekday")?.value;
  const hour = Number(tehranTime.find((part) => part.type === "hour")?.value ?? -1);
  const isOpen = weekday !== "Friday" && hour >= 8 && hour < 17;

  useEffect(() => {
    setReadingWidgetPresent(Boolean(document.querySelector(".reading-widget")));
  }, []);

  useScrollProgress(({ scrollTop, progress }) => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(
        RING_CIRCUMFERENCE * (1 - progress),
      );
    }
    if (btnRef.current) {
      btnRef.current.hidden = scrollTop <= showAfter;
    }
  });

  return (
    <>
      {/* Floating chat bubbles */}
      <div className="float-chat end-4">
        <div className="float-hours-control">
          <button
            type="button"
            className="float-chat-btn float-hours-btn"
            aria-label={labels.officeHours}
            aria-expanded={hoursOpen}
            aria-controls="floating-office-hours"
            onClick={() => setHoursOpen((open) => !open)}
          >
            <ClockIcon className="relative z-10 h-5 w-5" />
          </button>
          {hoursOpen && (
            <section id="floating-office-hours" className="float-hours-panel" aria-label={labels.officeHours}>
              <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                <h2 className="text-sm font-bold text-text-primary">{labels.officeHours}</h2>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isOpen ? "text-emerald-600" : "text-rose-600"}`}>
                  <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {isOpen ? labels.openNow : labels.closedNow}
                </span>
              </div>
              <div className="mt-3 flex justify-between gap-6 text-sm text-text-secondary">
                <span>{labels.workingDays}</span>
                <span dir="ltr">08:00–17:00</span>
              </div>
              <div className="mt-2 flex justify-between gap-6 text-sm text-text-secondary">
                <span>{labels.friday}</span>
                <span>{labels.fridayHours}</span>
              </div>
            </section>
          )}
        </div>
        <a
          href={siteConfig.socials.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="float-chat-btn bg-sky-500/90 text-white shadow-[0_0_24px_-4px_rgba(14,165,233,0.7)] hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-deep"
          aria-label={labels.telegram}
          data-label={labels.telegram}
        >
          <TelegramIcon className="relative z-10 h-5 w-5" />
        </a>
        <a
          href={siteConfig.socials.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="float-chat-btn bg-green-500/90 text-white shadow-[0_0_24px_-4px_rgba(34,197,94,0.7)] hover:bg-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-deep"
          aria-label={labels.whatsapp}
          data-label={labels.whatsapp}
        >
          <WhatsAppIcon className="relative z-10 h-5 w-5" />
        </a>
      </div>

      {/* Back to top with progress ring */}
      {!readingWidgetPresent && (
        <button
          ref={btnRef}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          hidden
          className="back-to-top start-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-deep rounded-full"
          aria-label={labels.backToTop}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className="progress-ring"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(26,115,82,0.15)"
              strokeWidth="3"
            />
            <circle
              ref={ringRef}
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
              transform="rotate(-90 24 24)"
            />
          </svg>
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-lg transition-colors duration-300">
            <ArrowUpIcon className="h-5 w-5" />
          </span>
        </button>
      )}
    </>
  );
}