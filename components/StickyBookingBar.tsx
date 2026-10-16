"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBookingModal } from "@/components/BookingModalProvider";

/**
 * StickyBookingBar — single conversion CTA after the hero on small screens.
 * One fixed div, transform-only show/hide, pointer-events gated so it never
 * blocks content when hidden. Appears past 70vh, hides near the footer CTA
 * and when the booking modal is open.
 */
export default function StickyBookingBar({
  label,
  isFa,
}: {
  label: string;
  isFa: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const { isOpen: modalOpen } = useBookingModal();

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const past = window.scrollY > window.innerHeight * 0.7;
      // Hide when the footer is in view (its own booking CTA takes over)
      const footer = document.querySelector("footer");
      const nearFooter = footer
        ? footer.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setVisible(past && !nearFooter);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const show = visible && !modalOpen;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 transition-transform duration-300 ease-out md:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      aria-hidden={!show}
    >
      <Link
        href="/booking"
        tabIndex={show ? 0 : -1}
        className="group flex min-h-[52px] items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--color-rule-strong)] bg-deep px-4 text-base font-bold text-text-on-dark shadow-[0_-8px_30px_-10px_rgba(2,6,23,0.5)] backdrop-blur-md active:scale-[0.98]"
      >
        <span className="flex items-center gap-2.5">
          <span className="status-led" aria-hidden="true" />
          <span className="readout__label text-highlight">
            {isFa ? "نوبت" : "BOOK"} · SLOT
          </span>
          <span className="text-sm font-bold text-text-on-dark">{label}</span>
        </span>
        <span
          className="readout__label hidden text-muted sm:block"
          dir={isFa ? "rtl" : "ltr"}
        >
          {isFa ? "< ۲۴H" : "< 24H"}
        </span>
      </Link>
    </div>
  );
}
