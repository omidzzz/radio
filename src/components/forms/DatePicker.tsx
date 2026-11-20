"use client";

import { createPortal } from "react-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "../providers/LocaleProvider";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { clinicClock } from "@/lib/clinic-schedule";

// ── Jalali calendar via Intl (guaranteed correct) ──
const PERSIAN_DF = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

/** Convert a Gregorian Date → [jalaliYear, jalaliMonth, jalaliDay] */
function getJalali(date: Date): [number, number, number] {
  const parts = PERSIAN_DF.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return [get("year"), get("month"), get("day")];
}

// Memoization cache for jalaliMonthRange results (pure function, safe to cache)
const jalaliMonthCache = new Map<string, { start: Date; length: number }>();

/**
 * Given a Jalali year & month, find the range of Gregorian dates
 * that fall within it.
 */
function jalaliMonthRange(jy: number, jm: number): { start: Date; length: number } {
  const cacheKey = `${jy}-${jm}`;
  const cached = jalaliMonthCache.get(cacheKey);
  if (cached) return cached;

  // Approximate starting point: Persian year ≈ Gregorian year - 621
  let candidate = new Date(Date.UTC(jy + 621, jm - 1, 15));

  // Walk backward until we leave this Jalali month, then step forward to its start
  let [cy, cm] = getJalali(candidate);
  while (!(cy === jy && cm === jm) && candidate.getUTCFullYear() > jy + 610) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    [cy, cm] = getJalali(candidate);
  }
  // Step backward to the first day
  while (true) {
    const before = new Date(candidate);
    before.setUTCDate(before.getUTCDate() - 1);
    const [by, bm] = getJalali(before);
    if (by === jy && bm === jm) {
      candidate = before;
    } else {
      break;
    }
  }

  // Count days in this Jalali month
  let length = 0;
  const curr = new Date(candidate);
  while (true) {
    const [y, m] = getJalali(curr);
    if (y !== jy || m !== jm) break;
    length++;
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  const result = { start: candidate, length };
  jalaliMonthCache.set(cacheKey, result);
  return result;
}

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];
const JALALI_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const GREGORIAN_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const GREGORIAN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  isDateDisabled?: (dateStr: string) => boolean;
  placeholder?: string;
  className?: string;
  /** Disable the whole field (e.g. while availability config loads) */
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  placeholder = "",
  className = "",
  disabled = false,
}: DatePickerProps) {
  const { locale } = useLocale();
  const isFa = locale === "fa";
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const d = new Date(value + "T00:00:00Z");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date((min || clinicClock().date) + "T00:00:00Z");
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  // Render the popup outside the modal's overflow containers so it can't be
  // clipped by them, and keep it aligned to the trigger while open.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    const reposition = () => {
      const rect = trigger.getBoundingClientRect();
      const popup = popupRef.current;
      if (!popup) return;
      const popupHeight = popup.offsetHeight;
      const popupWidth = popup.offsetWidth;

      // Default: below the trigger (replaces the old `mt-1`)
      let top = rect.bottom + 6;
      if (top + popupHeight > window.innerHeight) {
        // Not enough room below → open above the trigger
        top = rect.top - popupHeight - 6;
      }
      if (top < 6) top = 6;

      let left = rect.left;
      if (left + popupWidth > window.innerWidth) left = window.innerWidth - popupWidth - 8;
      if (left < 8) left = 8;

      setPopupPosition({ top, left });
    };

    reposition();
    window.addEventListener("scroll", reposition);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  // Close on outside click or Escape; return focus to the trigger on close
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const formatDisplay = useCallback(
    (date: Date) => {
      if (isNaN(date.getTime())) return "";
      if (isFa) {
        const [jy, jm, jd] = getJalali(date);
        return `${toFarsiDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toFarsiDigits(jy)}`;
      }
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    [isFa]
  );

  const handleSelect = (date: Date) => {
    onChange(toISO(date));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const isDisabled = (date: Date) => {
    const iso = toISO(date);
    if ((min && iso < min) || (max && iso > max)) return true;
    if (isDateDisabled && isDateDisabled(iso)) return true;
    return false;
  };

  /**
   * Unified month-grid renderer shared by both calendar systems.
   * Both calendars resolve display day numbers against a UTC month start.
   */
  const renderMonthGrid = ({
    cells,
    monthStart,
    headerLabel,
    weekdays,
    onPrev,
    onNext,
    rtl,
  }: {
    cells: (number | null)[];
    /** First Gregorian date of the displayed month, represented at UTC midnight. */
    monthStart: Date;
    headerLabel: string;
    weekdays: string[];
    onPrev: () => void;
    onNext: () => void;
    rtl: boolean;
  }) => {
    const today = clinicClock().date;

    return (
      <div className="p-3" dir={rtl ? "rtl" : "ltr"}>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="ui-icon-button ui-icon-button-compact h-7 w-7 border-transparent bg-transparent"
            aria-label={isFa ? "ماه قبل" : "Previous month"}
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              style={{ transform: rtl ? "scaleX(-1)" : "scaleX(1)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm font-semibold text-text-primary">{headerLabel}</div>
          <button
            type="button"
            onClick={onNext}
            className="ui-icon-button ui-icon-button-compact h-7 w-7 border-transparent bg-transparent"
            aria-label={isFa ? "ماه بعد" : "Next month"}
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              style={{ transform: rtl ? "scaleX(-1)" : "scaleX(1)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
          {weekdays.map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const date = new Date(monthStart);
            date.setUTCDate(date.getUTCDate() + day - 1);
            const iso = toISO(date);
            const selected = iso === value;
            const disabledDay = isDisabled(date);
            const isToday = iso === today;

            return (
              <button
                key={i}
                type="button"
                disabled={disabledDay}
                onClick={() => handleSelect(date)}
                aria-pressed={selected}
                className={`ui-button ui-button-compact h-8 w-8 px-0 text-sm ${
                  selected
                    ? "ui-button-primary font-semibold"
                    : disabledDay
                    ? "cursor-not-allowed border-transparent bg-transparent text-muted/50"
                    : isToday
                    ? "ui-button-ghost font-semibold text-primary ring-1 ring-primary"
                    : "ui-button-ghost border-transparent bg-transparent text-text-primary"
                }`}
              >
                {rtl ? toFarsiDigits(day) : day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Jalali calendar ──
  const renderJalaliCalendar = () => {
    const [vy, vm] = getJalali(viewDate);
    const { start, length } = jalaliMonthRange(vy, vm);
    // Jalali week starts Saturday (index 6 in JS = Saturday)
    const firstWeekday = (start.getUTCDay() + 1) % 7;

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= length; d++) cells.push(d);

    const goToMonth = (njr: number, njm: number) => {
      const r = jalaliMonthRange(njr, njm);
      setViewDate(new Date(r.start));
    };

    return renderMonthGrid({
      cells,
      monthStart: start,
      headerLabel: `${JALALI_MONTHS[vm - 1]} ${toFarsiDigits(vy)}`,
      weekdays: JALALI_WEEKDAYS,
      onPrev: () => goToMonth(vm === 1 ? vy - 1 : vy, vm === 1 ? 12 : vm - 1),
      onNext: () => goToMonth(vm === 12 ? vy + 1 : vy, vm === 12 ? 1 : vm + 1),
      rtl: true,
    });
  };

  // ── Gregorian calendar ──
  const renderGregorianCalendar = () => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return renderMonthGrid({
      cells,
      monthStart: new Date(Date.UTC(year, month, 1)),
      headerLabel: `${GREGORIAN_MONTHS[month]} ${year}`,
      weekdays: GREGORIAN_WEEKDAYS,
      onPrev: () => setViewDate(new Date(Date.UTC(year, month - 1, 1))),
      onNext: () => setViewDate(new Date(Date.UTC(year, month + 1, 1))),
      rtl: false,
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-start text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className={value ? "" : "text-muted"}>
          {value ? formatDisplay(new Date(value + "T00:00:00Z")) : placeholder || (isFa ? "انتخاب تاریخ" : "Select date")}
        </span>
        <svg
          className="ms-2 h-4 w-4 shrink-0 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={popupRef}
          role="dialog"
          aria-label={isFa ? "تقویم انتخاب تاریخ" : "Date picker"}
          className="anim-scale-in fixed z-[100] w-72 rounded-xl border border-border bg-surface shadow-xl"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
            animationDuration: "0.18s",
          }}
        >
          {isFa ? renderJalaliCalendar() : renderGregorianCalendar()}
        </div>,
        document.body
      )}
    </div>
  );
}