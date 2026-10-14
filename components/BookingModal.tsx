"use client";

import { useEffect, useRef } from "react";
import BookingForm from "./BookingForm";
import { useLocale } from "./LocaleProvider";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const { locale } = useLocale();
  const isFa = locale === "fa";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll + capture focus while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    prevFocusRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (container) {
      // Focus the close button initially
      container.querySelector<HTMLElement>("[data-close-btn]")?.focus();
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocusRef.current?.focus?.();
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop with fade transition */}
      <button
        type="button"
        aria-label={isFa ? "بستن" : "Close"}
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-deep/70 backdrop-blur-sm anim-fade-in"
        style={{ animationDuration: "0.25s" }}
      />

      {/* Dialog panel */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={isFa ? "رزرو نوبت" : "Book an appointment"}
        className="relative z-10 flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl border border-primary/25 bg-bg shadow-[0_30px_80px_-12px_rgba(0,0,0,0.55)] anim-fade-up sm:max-w-2xl sm:rounded-3xl"
        style={{ animationDuration: "0.35s" }}
        dir={isFa ? "rtl" : "ltr"}
      >
        {/* Top energy bar */}
        <div className="relative h-1.5 shrink-0 overflow-hidden bg-deep">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-300 to-secondary" />
          <div className="absolute inset-y-0 left-0 w-1/3 animate-pulse bg-white/25" />
        </div>

        {/* Header */}
        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-border/70 bg-surface/80 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
          <div className="flex items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-primary ring-1 ring-primary/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary sm:text-xl">
                {isFa ? "رزرو سریع نوبت" : "Quick Booking"}
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                {isFa
                  ? "فرم را پر کنید تا تیم ما با شما تماس بگیرد."
                  : "Fill in the form and our team will reach out to confirm."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-close-btn
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            aria-label={isFa ? "بستن" : "Close"}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-5 sm:px-8 sm:pb-8">
          <BookingForm embedded />
        </div>
      </div>
    </div>
  );
}