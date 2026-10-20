"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "../providers/LocaleProvider";
import { toFarsiDigits } from "@/lib/i18n/numbers";

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
  let curr = new Date(candidate);
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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
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
      const d = new Date(value + "T12:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click or Escape; return focus to the trigger on close
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    if (min && date < new Date(min + "T00:00:00")) return true;
    if (max && date > new Date(max + "T00:00:00")) return true;
    if (isDateDisabled && isDateDisabled(toISO(date))) return true;
    return false;
  };

  /**
   * Unified month-grid renderer shared by both calendar systems.
   * `cells` are either day numbers (Jalali, resolved against `monthStart`)
   * or pre-built Date objects (Gregorian).
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
    /** First real day of the displayed month (used to resolve Jalali day numbers) */
    monthStart: Date | null;
    headerLabel: string;
    weekdays: string[];
    onPrev: () => void;
    onNext: () => void;
    rtl: boolean;
  }) => {
    const now = new Date();

    return (
      <div className="p-3" dir={rtl ? "rtl" : "ltr"}>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-soft hover:text-primary"
            aria-label={isFa ? "ماه قبل" : "Previous month"}
          >
            <svg
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm font-semibold text-text-primary">{headerLabel}</div>
          <button
            type="button"
            onClick={onNext}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-soft hover:text-primary"
            aria-label={isFa ? "ماه بعد" : "Next month"}
          >
            <svg
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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
            const date =
              monthStart !== null
                ? (() => {
                    const d = new Date(monthStart);
                    d.setUTCDate(d.getUTCDate() + day - 1);
                    return d;
                  })()
                : (day as unknown as Date);
            const iso = toISO(date);
            const selected = iso === value;
            const disabledDay = isDisabled(date);
            const isToday =
              now.getFullYear() === date.getFullYear() &&
              now.getMonth() === date.getMonth() &&
              now.getDate() === date.getDate();

            return (
              <button
                key={i}
                type="button"
                disabled={disabledDay}
                onClick={() => handleSelect(date)}
                aria-pressed={selected}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                  selected
                    ? "bg-primary-fill font-semibold text-on-primary"
                    : disabledDay
                    ? "cursor-not-allowed text-muted/50"
                    : isToday
                    ? "font-semibold text-primary ring-1 ring-primary"
                    : "text-text-primary hover:bg-primary/10"
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
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(Date.UTC(year, month, d)) as unknown as number);
    }

    return renderMonthGrid({
      cells,
      monthStart: null,
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
          {value ? formatDisplay(new Date(value + "T12:00:00")) : placeholder || (isFa ? "انتخاب تاریخ" : "Select date")}
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

      {open && (
        <div
          role="dialog"
          aria-label={isFa ? "تقویم انتخاب تاریخ" : "Date picker"}
          className="anim-scale-in absolute z-50 mt-1 w-72 rounded-xl border border-border bg-surface shadow-xl"
          style={{ animationDuration: "0.18s" }}
        >
          {isFa ? renderJalaliCalendar() : renderGregorianCalendar()}
        </div>
      )}
    </div>
  );
}