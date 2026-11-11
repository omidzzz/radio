"use client";

import { useEffect, useState, useCallback } from "react";

interface ReservationsTabProps { admin: Record<string, any>; }
interface Booking { id: number; full_name: string; email: string; phone: string; session_type: string; preferred_date: string; preferred_time: string; notes: string | null; status: string; created_at: string; }

export default function ReservationsTab({ admin }: ReservationsTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch { setErr("Failed to load bookings."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      setOk("Status updated.");
      await load();
    } catch { setErr("Failed to update booking status."); }
  };

  const remove = async (id: number) => {
    if (!window.confirm((admin.deleteBookingConfirm as string) || "Delete?")) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk("Booking deleted.");
      await load();
    } catch { setErr("Failed to delete booking."); }
  };

  return (
    <section>
      {err && <div className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{err}</div>}
      {ok && <div className="mb-4 rounded-lg border border-positive/30 bg-positive-soft px-4 py-3 text-sm text-positive">{ok}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead><tr className="text-left border-b border-border bg-surface/50">
            <th className="pb-3 text-sm font-semibold text-text-secondary">ID</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.from}</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.email}</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.phone}</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.session}</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.preferred}</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Status</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.submitted}</th>
            <th className="pb-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
          </tr></thead>
          <tbody className="text-sm">
            {loading ? <tr><td colSpan={9} className="py-4 text-center text-text-muted">Loading…</td></tr> : bookings.length === 0 ? <tr><td colSpan={9} className="py-4 text-center text-text-muted">{admin.noBookings}</td></tr> : bookings.map((b) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                <td className="py-3 text-text-muted">#{b.id}</td>
                <td className="py-3 text-text-primary">{b.full_name}</td>
                <td className="py-3 text-text-primary">{b.email}</td>
                <td className="py-3 text-text-primary">{b.phone}</td>
                <td className="py-3 text-text-muted">{b.session_type}</td>
                <td className="py-3 text-text-primary">{b.preferred_date} {b.preferred_time}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-semibold border ${b.status === "confirmed" ? "border-ok bg-ok/10 text-ok" : b.status === "pending" ? "border-accent bg-accent/10 text-accent" : b.status === "cancelled" ? "border-danger bg-danger/10 text-danger" : "border-ok bg-ok/20 text-ok"}`}>{b.status}</span></td>
                <td className="py-3 text-text-muted">{b.created_at}</td>
                <td className="py-3 text-right">
                  {b.status !== "confirmed" && <button onClick={() => setStatus(b.id, "confirmed")} className="text-xs text-primary hover:underline mr-2">Confirm</button>}
                  {b.status !== "cancelled" && <button onClick={() => setStatus(b.id, "cancelled")} className="text-xs text-danger hover:underline mr-2">Cancel</button>}
                  <button onClick={() => remove(b.id)} className="text-xs text-text-muted hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
