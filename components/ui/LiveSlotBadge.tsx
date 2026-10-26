"use client";

import { toFarsiDigits } from "@/lib/i18n/numbers";
import { useBookingModal } from "@/components/forms/BookingModalProvider";

interface LiveSlotBadgeProps {
  isFa: boolean;
  className?: string;
  /** When provided, the badge renders as a link (booking CTA) */
  href?: string;
  /** Make the badge visually bolder — used when it replaces the Book Now button */
  primary?: boolean;
}

const nextSlotFa = `امروز ${toFarsiDigits("14:30")}`;
const nextSlotEn = "Today 14:30";

export default function LiveSlotBadge({
  isFa,
  className = "",
  href,
  primary = false,
}: LiveSlotBadgeProps) {
  const { openBookingModal } = useBookingModal();

  const baseClasses = `tnum inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-colors duration-200 ${
    // primary replaces the navbar Book Now button on the themed (light/dark)
    // bar — text-accent flips green↔gold per theme so it never sits gold-on-
    // sage. The non-primary variant renders on the always-dark hero, where
    // gold works in both themes.
    primary
      ? "border border-primary bg-surface text-accent hover:border-primary hover:bg-surface btn-shadow-light"
      : "border border-primary/50 bg-surface text-text-primary dark:text-text-primary hover:border-primary hover:bg-surface btn-shadow-light"
  } ${className}`;

  const dotClass = primary ? "bg-accent" : "bg-primary";

  const content = (
    <>
      {/* Status dot — ping only on sm+ to save mobile GPU */}
      <span className="relative flex h-2 w-2">
        <span className={`absolute hidden h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none sm:inline-flex ${dotClass}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
      </span>
      {isFa ? (
        <>
          نوبت بعدی: <span className="font-bold">{nextSlotFa}</span>
        </>
      ) : (
        <>
          Next Slot: <span className="font-bold">{nextSlotEn}</span>
        </>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          openBookingModal();
        }}
        className={`${baseClasses} cursor-pointer`}
        dir={isFa ? "rtl" : "ltr"}
        aria-label={isFa ? "رزرو نوبت بعدی" : "Book next available slot"}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={openBookingModal}
      className={`${baseClasses} cursor-pointer`}
      dir={isFa ? "rtl" : "ltr"}
      aria-label={isFa ? "رزرو نوبت بعدی" : "Book next available slot"}
    >
      {content}
    </button>
  );
}
