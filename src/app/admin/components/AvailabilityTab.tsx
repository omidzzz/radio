"use client";

import { useEffect, useState, useCallback } from "react";

interface AvailabilityTabProps { admin: Record<string, any>; }
interface DaySlot { id: number; day_of_week: number; is_available: number; start_time: string | null; end_time: string; }
interface UnavailableSlot { id: number; date: string; time: string; reason: string | null; created_at: string; }

export default function AvailabilityTab({ admin }: AvailabilityTabProps) {
  const [settings, setSettings] = useState<any>(null);
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/admin/availability", { credentials: "include" }),
        fetch("/api/admin/unavailable-slots", { credentials: "include" }),
      ]);
      if (r1.ok) { const d = await r1.json(); setSettings(d.settings); setDaySlots(d.daySlots || []); }
      if (r2.ok) { const d = await r2.json(); setUnavailableSlots(d.slots || []); }
    } catch { setErr("Failed to load availability."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async () => {
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          first_available_date: settings.first_available_date,
          booking_window_days: settings.booking_window_days,
          slot_duration_minutes: settings.slot_duration_minutes,
          daySlots: daySlots.map((s) => ({ id: s.id, day_of_week: s.day_of_week, is_available: s.is_available, start_time: s.start_time, end_time: s.end_time })),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setOk((admin.globalSettingsSaved as string) || "Settings saved.");
    } catch { setErr((admin.failedToSaveSettings as string) || "Failed to save settings."); }
  };

  const loadUnavailable = async () => {
    const res = await fetch("/api/admin/unavailable-slots", { credentials: "include" });
    if (res.ok) { const d = await res.json(); setUnavailableSlots(d.slots || []); }
  };

  const blockSlot = async () => {
    const dEl = document.getElementById("blockDate") as HTMLInputElement;
    const tEl = document.getElementById("blockTime") as HTMLInputElement;
    const rEl = document.getElementById("blockReason") as HTMLInputElement;
    if (!dEl.value || !tEl.value) return;
    try {
      const res = await fetch("/api/admin/unavailable-slots", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ date: dEl.value, time: tEl.value, reason: rEl.value }),
      });
      if (!res.ok) throw new Error("Failed");
      setOk((admin.slotBlocked as string) || "Slot blocked.");
      dEl.value = ""; tEl.value = ""; rEl.value = "";
      await loadUnavailable();
    } catch { setErr((admin.failedToBlockSlot as string) || "Failed to block slot."); }
  };

  const unblock = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/unavailable-slots?id=${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk((admin.slotUnblocked as string) || "Slot unblocked.");
      await loadUnavailable();
    } catch { setErr((admin.failedToUnblockSlot as string) || "Failed to unblock slot."); }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{admin.globalSettings}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.firstAvailableDate}</label>
            <input type="date" defaultValue={settings?.first_available_date || ""} onChange={(e) => setSettings((s: any) => ({ ...s!, first_available_date: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            <p className="text-xs text-text-muted mt-1">{admin.firstAvailableDateHint}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.bookingWindowDays}</label>
            <input type="number" defaultValue={settings?.booking_window_days || 30} onChange={(e) => setSettings((s: any) => ({ ...s!, booking_window_days: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            <p className="text-xs text-text-muted mt-1">{admin.bookingWindowDaysHint}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.sessionDuration}</label>
            <input type="number" defaultValue={settings?.slot_duration_minutes || 30} onChange={(e) => setSettings((s: any) => ({ ...s!, slot_duration_minutes: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            <p className="text-xs text-text-muted mt-1">{admin.sessionDurationHint}</p>
          </div>
        </div>
        <button onClick={saveSettings} className="mt-4 rounded-lg bg-primary-fill px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-fill-hover transition">
          {admin.saveGlobalSettings}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{admin.weeklySchedule}</h3>
        <p className="text-xs text-text-muted mb-4">{admin.weeklyScheduleHint}</p>
        <div className="grid gap-2">
          {daySlots.map((slot) => (
            <div key={slot.day_of_week} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface/50">
              <span className="text-sm text-text-primary">{dayNames[slot.day_of_week]}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={slot.is_available === 1} onChange={(e) => setDaySlots((prev) => prev.map((s: DaySlot) => s.day_of_week === slot.day_of_week ? { ...s, is_available: e.target.checked ? 1 : 0 } : s))} className="rounded border-border text-primary focus:ring-primary" />
                {admin.weeklySchedule}
              </label>
              <div className="flex gap-2">
                <input type="time" value={slot.start_time || ""} onChange={(e) => setDaySlots((prev) => prev.map((s: DaySlot) => s.day_of_week === slot.day_of_week ? { ...s, start_time: e.target.value } : s))} disabled={slot.is_available !== 1} className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text-primary" />
                <input type="time" value={slot.end_time || ""} onChange={(e) => setDaySlots((prev) => prev.map((s: DaySlot) => s.day_of_week === slot.day_of_week ? { ...s, end_time: e.target.value } : s))} disabled={slot.is_available !== 1} className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{admin.blockedTimeSlots}</h3>
        <p className="text-xs text-text-muted mb-4">{admin.blockedTimeSlotsHint}</p>
        <div className="space-y-3">
          {unavailableSlots.length === 0 ? <p className="text-xs text-text-muted">{admin.noBlockedSlots}</p> : unavailableSlots.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-red-200 bg-red-50/50">
              <div>
                <span className="text-sm font-medium text-text-primary">{s.date} at {s.time}</span>
                {s.reason && <p className="text-xs text-text-muted">{s.reason}</p>}
              </div>
              <button onClick={() => unblock(s.id)} className="text-xs text-red-600 hover:underline">{admin.unblockTime}</button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.date}</label>
            <input id="blockDate" type="date" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.time}</label>
            <input id="blockTime" type="time" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">{admin.reason}</label>
            <input id="blockReason" type="text" placeholder={admin.reasonPlaceholder} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-3">
            <button onClick={blockSlot} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition">
              {admin.blockTime}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}