"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDictionary } from "@/lib/i18n/client";
import { useForm } from "@/lib/hooks/useForm";
import DatePicker from "./DatePicker";
import Honeypot from "./Honeypot";

interface AvailabilitySettings {
  first_available_date: string;
  booking_window_days: number;
  slot_duration_minutes: number;
}

interface DaySlot {
  day_of_week: number;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

interface AvailabilityData {
  settings: AvailabilitySettings;
  daySlots: DaySlot[];
}

interface BookingFormData {
  full_name: string;
  email: string;
  phone: string;
  session_type: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  website_field?: string;
}

function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

const initialValues: BookingFormData = {
  full_name: "",
  email: "",
  phone: "",
  session_type: "initial-consultation",
  preferred_date: getTodayISO(),
  preferred_time: "",
  notes: "",
  website_field: "",
};

/** localStorage key for unsent form drafts */
const DRAFT_KEY = "booking-form-draft";

/**
 * Per-date cache of fetched time slots so toggling between dates
 * doesn't re-hit the API for dates we've already seen this session.
 */
const slotCache = new Map<string, string[]>();

/** Icons for each session-type card */
const SESSION_ICONS: Record<string, React.ReactNode> = {
  "initial-consultation": (
    // chat bubble
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 10h8M8 14h5m-9 6V6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H7l-3 3z"
    />
  ),
  "treatment-planning": (
    // clipboard with scan lines
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4"
    />
  ),
  "radiation-therapy": (
    // target/beam reticle
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v3m0 12v3M3 12h3m12 0h3M12 8a4 4 0 100 8 4 4 0 000-8zm0 2.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
    />
  ),
  "follow-up": (
    // clock with arrow
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 2m6-2a9 9 0 11-2.64-6.36M21 3v6h-6"
    />
  ),
  "second-opinion": (
    // eye
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  ),
};

interface BookingFormProps {
  /** When rendered inside a modal, remove the card chrome */
  embedded?: boolean;
}

export default function BookingForm({ embedded = false }: BookingFormProps) {
  const dict = useDictionary();
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Wizard state — step 1: session & schedule, step 2: contact details
  const [step, setStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState(false);

  const {
    values,
    errors,
    submitting,
    error,
    success,
    handleChange,
    handleSubmit,
    setValue,
    setValues,
    setError,
    setSuccess,
  } = useForm<BookingFormData>({
    initialValues,
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (vals.full_name.trim().length < 3) {
        errs.full_name = dict.booking.invalidName;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(vals.email.trim())) {
        errs.email = dict.booking.invalidEmail;
      }
      if (!/^[+()\d][\d\s\-()]{6,19}$/.test(vals.phone.trim())) {
        errs.phone = dict.booking.invalidPhone;
      }
      return errs;
    },
    onSubmit: async (formData) => {
      // Honeypot check - silently reject if filled
      if (formData.website_field) {
        setSuccess(dict.booking.successMessage);
        setValues(initialValues);
        setTimeSlots([]);
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking request");
      }

      // Store the booking reference number
      const bookingId = data.booking?.id;
      setBookingRef(bookingId ? `#${bookingId}` : null);

      setSuccess(dict.booking.successMessage);
      setValues(initialValues);
      setTimeSlots([]);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* storage unavailable — non-critical */
      }
    },
  });

  // ── Restore saved draft once on mount ──
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<BookingFormData>;
        setValues({ ...initialValues, ...draft });
      }
    } catch {
      /* corrupted draft — ignore */
    } finally {
      setDraftRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wizard navigation — step 1 requires a date and a time slot
  const goToDetails = useCallback(() => {
    if (!values.preferred_date || !values.preferred_time) {
      setStepError(true);
      return;
    }
    setStepError(false);
    setStep(2);
  }, [values.preferred_date, values.preferred_time]);

  // ── Persist draft on every change (after initial restore) ──
  useEffect(() => {
    if (!draftRestored || success) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* storage unavailable — non-critical */
    }
  }, [values, draftRestored, success]);

  // Scroll the confirmation banner into view once it appears
  useEffect(() => {
    if (success) {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [success]);

  // Fetch availability config on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch("/api/availability");
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    }
    fetchAvailability();
  }, []);

  // Fetch available time slots when date changes (with abort + cache)
  useEffect(() => {
    if (!values.preferred_date) {
      setTimeSlots([]);
      return;
    }

    // Serve from cache instantly when we've already fetched this date
    const cached = slotCache.get(values.preferred_date);
    if (cached) {
      setTimeSlots(cached);
      setLoadingSlots(false);
      if (values.preferred_time && !cached.includes(values.preferred_time)) {
        setValue("preferred_time", "");
      }
      return;
    }

    const controller = new AbortController();
    setLoadingSlots(true);
    async function fetchTimeSlots() {
      try {
        const res = await fetch(
          `/api/availability?date=${values.preferred_date}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const slots: string[] = data.timeSlots || [];
          slotCache.set(values.preferred_date, slots);
          setTimeSlots(slots);
          // If current selected time is no longer available, clear it
          if (values.preferred_time && !slots.includes(values.preferred_time)) {
            setValue("preferred_time", "");
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        console.error("Failed to fetch time slots:", err);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchTimeSlots();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.preferred_date]);

  const sessionTypes = Object.entries(dict.booking.sessionTypes).map(
    ([value, label]) => ({ value, label })
  );

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const labelClasses = "mb-1 block text-sm font-medium text-text-primary";

  // Compute min date for DatePicker
  const minDate = availability?.settings.first_available_date || getTodayISO();

  // Compute max date (first available + booking window)
  const maxDate = useCallback(() => {
    if (!availability) return undefined;
    const d = new Date(minDate + "T12:00:00");
    d.setDate(d.getDate() + availability.settings.booking_window_days);
    return toISO(d);
  }, [availability, minDate]);

  // Check if a date is available (day of week enabled + within window)
  const isDateDisabled = useCallback(
    (dateStr: string) => {
      if (!availability) return false;
      const date = new Date(dateStr + "T12:00:00");
      const dayOfWeek = date.getDay();
      const daySlot = availability.daySlots.find((s) => s.day_of_week === dayOfWeek);
      if (!daySlot || daySlot.is_available !== 1) return true;
      return false;
    },
    [availability]
  );

  // Find the first bookable date within the window (for the quick-pick button)
  const nextAvailableDate = useCallback((): string | null => {
    if (!availability) return null;
    const max = maxDate();
    const end = max ? new Date(max + "T12:00:00") : null;
    for (
      let d = new Date(minDate + "T12:00:00");
      end !== null && d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const iso = toISO(d);
      if (!isDateDisabled(iso)) return iso;
    }
    return null;
  }, [availability, minDate, maxDate, isDateDisabled]);

  const showNoSlots =
    !loadingSlots &&
    timeSlots.length === 0 &&
    Boolean(values.preferred_date) &&
    Boolean(availability);

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded
        ? "p-2 sm:p-4"
        : "rounded-2xl border border-border bg-surface p-8 shadow-sm"}
      noValidate
    >
      {!embedded && (
        <>
          <h2 className="text-2xl font-semibold text-text-primary">
            {dict.booking.formTitle}
          </h2>
          <p className="mt-2 text-text-secondary">{dict.booking.formSubtitle}</p>
        </>
      )}

      {/* Wizard progress — two steps */}
      <div className="flex items-center gap-3" aria-hidden="true">
        {[1, 2].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= n
                  ? "bg-primary text-white"
                  : "bg-soft text-muted ring-1 ring-border"
              }`}
            >
              {n}
            </span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
                step >= n ? "text-primary" : "text-muted"
              }`}
            >
              {n === 1
                ? dict.booking.wizardStepSession
                : dict.booking.wizardStepDetails}
            </span>
            {n === 1 && <span className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Honeypot />

      <div className="mt-6 space-y-5">
        {step === 2 && (
        <>
        {/* Summary of step-1 choices, with a quick way back */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-soft/60 px-4 py-3 text-sm">
          <span className="text-muted">{dict.booking.wizardSummary}:</span>
          <span className="font-medium text-text-primary">
            {sessionTypes.find((t) => t.value === values.session_type)?.label}
          </span>
          <span aria-hidden="true" className="text-muted">·</span>
          <span dir="auto" className="font-medium text-text-primary">
            {values.preferred_date}
          </span>
          {values.preferred_time && (
            <>
              <span aria-hidden="true" className="text-muted">·</span>
              <span dir="ltr" className="font-medium text-text-primary">
                {values.preferred_time}
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => { setStep(1); setStepError(false); }}
            className="ms-auto text-xs font-semibold text-primary hover:underline"
          >
            {dict.booking.wizardChange}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className={labelClasses}>
              {dict.booking.fullName}
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              value={values.full_name}
              onChange={handleChange}
              placeholder={dict.booking.namePlaceholder}
              aria-invalid={Boolean(errors.full_name)}
              className={`${inputClasses} ${errors.full_name ? "border-danger" : ""}`}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-danger">{errors.full_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className={labelClasses}>
              {dict.booking.phoneNumber}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange}
              placeholder={dict.booking.phonePlaceholder}
              aria-invalid={Boolean(errors.phone)}
              className={`${inputClasses} ${errors.phone ? "border-danger" : ""}`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-danger">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            {dict.booking.emailAddress}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            placeholder={dict.booking.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            className={`${inputClasses} ${errors.email ? "border-danger" : ""}`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email}</p>
          )}
        </div>
        </>
        )}

        {step === 1 && (
        <>
        {/* Session type — selectable cards */}
        <fieldset>
          <legend className={labelClasses}>{dict.booking.sessionType}</legend>
          <p className="-mt-0.5 mb-2.5 text-xs text-muted">
            {dict.booking.sessionTypeHint}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {sessionTypes.map((type) => {
              const selected = values.session_type === type.value;
              return (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                    selected
                      ? "border-primary bg-soft ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-soft/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="session_type"
                    value={type.value}
                    checked={selected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      selected
                        ? "bg-primary text-white"
                        : "bg-soft text-primary ring-1 ring-primary/20"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      {SESSION_ICONS[type.value]}
                    </svg>
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-medium ${
                        selected ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {type.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">
                      {
                        dict.booking.sessionDescriptions[
                          type.value as keyof typeof dict.booking.sessionDescriptions
                        ]
                      }
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="preferred_date" className={labelClasses}>
              {dict.booking.preferredDate}
            </label>
            <DatePicker
              value={values.preferred_date}
              onChange={(date) => {
                setValue("preferred_date", date);
                setValue("preferred_time", "");
              }}
              min={minDate}
              max={maxDate()}
              isDateDisabled={isDateDisabled}
              disabled={!availability}
              placeholder={
                availability
                  ? dict.booking.preferredDate
                  : dict.common.loading
              }
              className={inputClasses}
            />
          </div>
          <div>
            <span className={labelClasses} id="preferred-time-label">
              {dict.booking.preferredTime}
            </span>
            {loadingSlots ? (
              // Skeleton chips while slots load
              <div
                className="flex flex-wrap gap-2 pt-1"
                role="status"
                aria-label={dict.booking.loadingSlots}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-20 animate-pulse rounded-full bg-soft ring-1 ring-border"
                  />
                ))}
              </div>
            ) : timeSlots.length > 0 ? (
              <div
                className="flex flex-wrap gap-2 pt-1"
                role="radiogroup"
                aria-labelledby="preferred-time-label"
              >
                {timeSlots.map((slot) => {
                  const selected = values.preferred_time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue("preferred_time", slot)}
                      aria-pressed={selected}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        selected
                          ? "border-primary bg-primary text-white shadow-[0_0_16px_-4px_rgba(6,182,212,0.55)]"
                          : "border-border bg-surface text-text-secondary hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      <span dir="ltr" className="inline-block">{slot}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[42px] items-center rounded-lg border border-dashed border-border px-4 text-sm text-muted">
                {values.preferred_date
                  ? dict.booking.selectDateFirst
                  : dict.booking.selectTime}
              </div>
            )}
            {showNoSlots && (
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-danger" role="alert">
                  {dict.booking.noSlots}
                </p>
                {(() => {
                  const next = nextAvailableDate();
                  if (!next || next === values.preferred_date) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setValue("preferred_date", next);
                        setValue("preferred_time", "");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/10"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-3.5 w-3.5 rtl:rotate-180"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      {dict.booking.nextAvailable}
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {stepError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {dict.booking.wizardChooseTime}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={goToDetails}
            className="group relative inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white transition hover:bg-primary-hover"
          >
            {dict.booking.wizardNext}
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
            </svg>
          </button>
        </div>
        </>
        )}

        {step === 2 && (
        <div>
          <label htmlFor="notes" className={labelClasses}>
            {dict.booking.notes}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={handleChange}
            placeholder={dict.booking.notesPlaceholder}
            className={inputClasses}
          />
        </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            ref={successRef}
            role="status"
            aria-live="polite"
            className="rounded-lg bg-positive-soft px-4 py-3 text-sm text-positive"
          >
            <p className="font-medium">{success}</p>
            {bookingRef && (
              <p className="mt-1 font-semibold">
                {dict.booking.referenceNumber}
                <span dir="ltr" className="inline-block">{bookingRef}</span>
              </p>
            )}
          </div>
        )}

        {step === 2 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => { setStep(1); setStepError(false); }}
            className="rounded-lg border border-border px-6 py-3.5 text-base font-medium text-text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            {dict.booking.wizardBack}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group relative flex-1 overflow-hidden rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
          <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
            {submitting && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {submitting ? dict.common.submitting : dict.common.submit}
          </span>
          </button>
        </div>
        )}

        {/* Trust signal */}
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-3.5 w-3.5 shrink-0"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {dict.booking.trustNote}
        </p>
      </div>
    </form>
  );
}