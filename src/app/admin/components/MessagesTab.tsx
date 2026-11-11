"use client";

import { useEffect, useState, useCallback } from "react";

interface MessagesTabProps { admin: Record<string, any>; }
interface Message { id: number; name: string; email: string; subject: string; message: string; created_at: string; }

export default function MessagesTab({ admin }: MessagesTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { setErr("Failed to load messages."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: number) => {
    if (!window.confirm((admin.deleteMessageConfirm as string) || "Delete?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk("Message deleted.");
      await load();
    } catch { setErr("Failed to delete message."); }
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
            <th className="pb-3 text-sm font-semibold text-text-secondary">Subject</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Message</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">{admin.submitted}</th>
            <th className="pb-3 text-right text-sm font-semibold text-text-secondary">Actions</th>
          </tr></thead>
          <tbody className="text-sm">
            {loading ? <tr><td colSpan={7} className="py-4 text-center text-text-muted">Loading…</td></tr> : messages.length === 0 ? <tr><td colSpan={7} className="py-4 text-center text-text-muted">{admin.noMessages}</td></tr> : messages.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                <td className="py-3 text-text-muted">#{m.id}</td>
                <td className="py-3 text-text-primary">{m.name}</td>
                <td className="py-3 text-text-primary">{m.email}</td>
                <td className="py-3 text-text-primary">{m.subject}</td>
                <td className="py-3 text-text-muted max-w-[300px] truncate">{m.message}</td>
                <td className="py-3 text-text-muted">{m.created_at}</td>
                <td className="py-3 text-right"><button onClick={() => remove(m.id)} className="text-xs text-text-muted hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
