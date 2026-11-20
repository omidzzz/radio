"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/seo/seo";
import type { Locale } from "@/lib/i18n/config";
import OfficeHours from "@/components/ui/OfficeHours";
import { useClinicCopy } from "@/components/providers/ClinicCopyProvider";
import OfficeStatus from "@/components/ui/OfficeStatus";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { ArrowUpIcon, ClockIcon, PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";

export interface FloatingContactLabels {
  telegram: string;
  whatsapp: string;
  phone: string;
  backToTop: string;
  officeHours: string;
  openNow: string;
  closedNow: string;
}

interface FloatingContactProps {
  /** Localized labels used for tooltips and aria-labels */
  labels: FloatingContactLabels;
  locale: Locale;
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
  locale,
  showAfter = 400,
}: FloatingContactProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const [hoursOpen, setHoursOpen] = useState(false);
  const heading = useClinicCopy(locale)?.hours?.heading ?? labels.officeHours;
  // Set post-mount; false on the server so there is no hydration mismatch.
  const [readingWidgetPresent, setReadingWidgetPresent] = useState(false);

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
            aria-label={heading}
            data-label={heading}
            aria-expanded={hoursOpen}
            aria-controls="floating-office-hours"
            onClick={() => setHoursOpen((open) => !open)}
          >
            <ClockIcon className="relative z-10 h-5 w-5" />
          </button>
          {hoursOpen && (
            <section id="floating-office-hours" className="float-hours-panel" aria-label={heading}>
              <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                <h2 className="text-sm font-bold text-text-primary">{heading}</h2>
                <OfficeStatus open={labels.openNow} closed={labels.closedNow} />
              </div>
              <OfficeHours locale={locale} className="mt-3 text-sm text-text-secondary" />
            </section>
          )}
        </div>
        <a
          href={siteConfig.socials.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="float-chat-btn float-contact-btn float-telegram-btn"
          aria-label={labels.telegram}
          data-label={labels.telegram}
        >
          <TelegramIcon className="relative z-10 h-5 w-5" />
        </a>
        <a
          href={siteConfig.socials.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="float-chat-btn float-contact-btn float-whatsapp-btn"
          aria-label={labels.whatsapp}
          data-label={labels.whatsapp}
        >
          <WhatsAppIcon className="relative z-10 h-5 w-5" />
        </a>
        <a
          href={siteConfig.mobileHref}
          className="float-chat-btn float-contact-btn float-phone-btn"
          aria-label={labels.phone}
          data-label={labels.phone}
        >
          <PhoneIcon className="relative z-10 h-5 w-5" />
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