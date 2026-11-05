"use client";

import { useEffect, useState, useCallback } from "react";
import { csrfHeaders } from "@/lib/http/csrf";
import { useDictionary } from "@/lib/i18n/client";
import { useLocale } from "@/components/providers/LocaleProvider";

interface AvailabilitySettings {
  id: number;
  first_available_date: string;
  booking_window_days: number;
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface DaySlot {
  id: number;
  day_of_week: number;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

interface AvailabilityData {
  settings: AvailabilitySettings;
  daySlots: DaySlot[];
}

interface UnavailableSlot {
  id: number;
  date: string;
  time: string;
  reason: string | null;
  created_at: string;
}

const DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_NAMES_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];
// Display order: Saturday-first (شنبه start of week)
const ORDER = [6, 0, 1, 2, 3, 4, 5];

export default function AvailabilityManager() {
  const dict = useDictionary();
  const { locale } = useLocale();
  const isFa = locale === "fa";
  const dayNames = isFa ? DAY_NAMES_FA : DAY_NAMES_EN;
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [firstAvailableDate, setFirstAvailableDate] = useState("");
  const [bookingWindowDays, setBookingWindowDays] = useState(30);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);

  // Day slot editing state
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);

  // Unavailable slots state
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/availability");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) {
        throw new Error(dict.admin.failedToLoadAvailability);
      }
      const data = await res.json();
      setData(data);
      setFirstAvailableDate(data.settings.first_available_date);
      setBookingWindowDays(data.settings.booking_window_days);
      setSlotDurationMinutes(data.settings.slot_duration_minutes);
      setDaySlots(data.daySlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.admin.failedToLoadAvailability);
    } finally {
      setLoading(false);
    }
  }, [dict]);

  const fetchUnavailableSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/unavailable-slots");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) {
        throw new Error(dict.admin.failedToLoadUnavailableSlots);
      }
      const data = await res.json();
      setUnavailableSlots(data.slots);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : dict.admin.failedToLoadUnavailableSlots
      );
    }
  }, [dict]);

  useEffect(() => {
    fetchAvailability();
    fetchUnavailableSlots();
  }, [fetchAvailability, fetchUnavailableSlots]);

  const saveGlobalSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PATCH",
        headers: csrfHeaders(),
        body: JSON.stringify({
          first_available_date: firstAvailableDate,
          booking_window_days: Number(bookingWindowDays),
          slot_duration_minutes: Number(slotDurationMinutes),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || dict.admin.failedToSaveSettings);
      }
      setSuccess(dict.admin.globalSettingsSaved);
      fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.admin.failedToSaveSettings);
    } finally {
      setSaving(false);
    }
  };

  const updateDaySlot = async (dayOfWeek: number, updates: Partial<DaySlot>) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PATCH",
        headers: csrfHeaders(),
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          ...updates,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || dict.admin.failedToUpdateDaySlot);
      }
      setSuccess(dict.admin.dayScheduleUpdated);
      fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.admin.failedToUpdateDaySlot);
    } finally {
      setSaving(false);
    }
  };

  const toggleDayAvailability = (dayOfWeek: number) => {
    const slot = daySlots.find((s) => s.day_of_week === dayOfWeek);
    if (!slot) return;
    const newAvailable = slot.is_available === 1 ? 0 : 1;
    updateDaySlot(dayOfWeek, {
      is_available: newAvailable,
      start_time: newAvailable === 1 ? slot.start_time || "08:00" : null,
      end_time: newAvailable === 1 ? slot.end_time || "17:00" : null,
    });
  };

  const updateDayTime = (dayOfWeek: number, field: "start_time" | "end_time", value: string) => {
    const slot = daySlots.find((s) => s.day_of_week === dayOfWeek);
    if (!slot) return;
    updateDaySlot(dayOfWeek, { [field]: value });
  };

  const addBlockedSlot = async () => {
    if (!blockDate || !blockTime) {
      setError(dict.admin.blockTimeRequired);
      return;
    }
    setBlocking(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/unavailable-slots", {
        method: "POST",
        headers: csrfHeaders(),
        body: JSON.stringify({
          date: blockDate,
          time: blockTime,
          reason: blockReason || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || dict.admin.failedToBlockSlot);
      }
      setSuccess(dict.admin.slotBlocked);
      setBlockDate("");
      setBlockTime("");
      setBlockReason("");
      fetchUnavailableSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.admin.failedToBlockSlot);
    } finally {
      setBlocking(false);
    }
  };

  const removeBlockedSlot = async (id: number) => {
    if (!confirm(dict.admin.unblockTimeConfirm)) return;
    setBlocking(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/unavailable-slots?id=${id}`, {
        method: "DELETE",
        headers: csrfHeaders(),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || dict.admin.failedToUnblockSlot);
      }
      setSuccess(dict.admin.slotUnblocked);
      fetchUnavailableSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.admin.failedToUnblockSlot);
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-lg text-text-secondary">{dict.common.loading}</div>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const labelClasses = "mb-1 block text-sm font-medium text-text-primary";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">
          {dict.admin.availabilitySettings}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {dict.admin.availabilityDescription}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Global Settings */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          {dict.admin.globalSettings}
        </h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="first_available_date" className={labelClasses}>
              {dict.admin.firstAvailableDate}
            </label>
            <input
              id="first_available_date"
              type="date"
              value={firstAvailableDate}
              onChange={(e) => setFirstAvailableDate(e.target.value)}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-muted">
              {dict.admin.firstAvailableDateHint}
            </p>
          </div>
          <div>
            <label htmlFor="booking_window_days" className={labelClasses}>
              {dict.admin.bookingWindowDays}
            </label>
            <input
              id="booking_window_days"
              type="number"
              min={1}
              max={365}
              value={bookingWindowDays}
              onChange={(e) => setBookingWindowDays(Number(e.target.value))}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-muted">
              {dict.admin.bookingWindowDaysHint}
            </p>
          </div>
          <div>
            <label htmlFor="slot_duration_minutes" className={labelClasses}>
              {dict.admin.sessionDuration}
            </label>
            <input
              id="slot_duration_minutes"
              type="number"
              min={10}
              max={240}
              step={5}
              value={slotDurationMinutes}
              onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-muted">
              {dict.admin.sessionDurationHint}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <button
            onClick={saveGlobalSettings}
            disabled={saving}
            className="rounded-lg bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? dict.admin.saving : dict.admin.saveGlobalSettings}
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          {dict.admin.weeklySchedule}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {dict.admin.weeklyScheduleHint}
        </p>

        <div className="mt-5 space-y-3">
          {ORDER.map((dayOfWeek) => {
            const slot = daySlots.find((s) => s.day_of_week === dayOfWeek);
            if (!slot) return null;
            return (
            <div
              key={slot.day_of_week}
              className={`flex flex-wrap items-center gap-4 rounded-xl border p-4 transition ${
                slot.is_available === 1
                  ? "border-green-200 bg-green-50/50"
                  : "border-border bg-gray-50"
              }`}
            >
              <div className="flex min-w-[140px] items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDayAvailability(slot.day_of_week)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    slot.is_available === 1 ? "bg-green-500" : "bg-gray-300"
                  }`}
                  aria-label={`Toggle ${dayNames[slot.day_of_week]} availability`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform ${
                      slot.is_available === 1 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-text-primary">
                  {dayNames[slot.day_of_week]}
                </span>
              </div>

              {slot.is_available === 1 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-text-secondary">
                      {dict.admin.start}
                    </label>
                    <input
                      type="time"
                      value={slot.start_time || "08:00"}
                      onChange={(e) =>
                        updateDayTime(slot.day_of_week, "start_time", e.target.value)
                      }
                      disabled={saving}
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-text-secondary">
                      {dict.admin.end}
                    </label>
                    <input
                      type="time"
                      value={slot.end_time || "17:00"}
                      onChange={(e) =>
                        updateDayTime(slot.day_of_week, "end_time", e.target.value)
                      }
                      disabled={saving}
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                  {dict.admin.closed}
                </span>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Time Slots */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">
          {dict.admin.blockedTimeSlots}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {dict.admin.blockedTimeSlotsHint}
        </p>

        {/* Block a slot form */}
        <div className="mt-5 rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold text-text-primary">
            {dict.admin.blockTimeSlot}
          </h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="block_date" className={labelClasses}>
                {dict.admin.date}
              </label>
              <input
                id="block_date"
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="block_time" className={labelClasses}>
                {dict.admin.time}
              </label>
              <input
                id="block_time"
                type="time"
                value={blockTime}
                onChange={(e) => setBlockTime(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="block_reason" className={labelClasses}>
                {dict.admin.reason}
              </label>
              <input
                id="block_reason"
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={dict.admin.reasonPlaceholder}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addBlockedSlot}
              disabled={blocking || !blockDate || !blockTime}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {blocking ? dict.admin.blocking : dict.admin.blockTime}
            </button>
          </div>
        </div>

        {/* List of blocked slots */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-text-primary">
            {dict.admin.blockedSlotsList}
          </h4>
          {unavailableSlots.length === 0 ? (
            <p className="mt-2 text-sm text-text-secondary">
              {dict.admin.noBlockedSlots}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {unavailableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">
                      {slot.date} at {slot.time}
                    </span>
                    {slot.reason && (
                      <span className="text-xs text-text-secondary">
                        {slot.reason}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlockedSlot(slot.id)}
                    disabled={blocking}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {dict.admin.unblockTime}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
