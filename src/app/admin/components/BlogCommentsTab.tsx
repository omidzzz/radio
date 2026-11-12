"use client";

import { useEffect, useState, useCallback } from "react";

interface BlogCommentsTabProps { admin: Record<string, any>; }
interface Comment { id: number; post_id: number; author_name: string; content: string; is_approved: number; created_at: string; post_title: string | null; }

export default function BlogCommentsTab({ admin }: BlogCommentsTabProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments?type=blog", { credentials: "include" });
      if (!res.ok) return;
      const d = await res.json();
      setComments(d.comments || []);
    } catch { setErr("Failed to load blog comments."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: number, approved: boolean) => {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ id, is_approved: approved ? 1 : 0 }),
      });
      if (!res.ok) throw new Error("Failed");
      setOk(approved ? "Comment approved." : "Comment rejected.");
      await load();
    } catch { setErr("Failed to update comment."); }
  };

  const delComment = async (id: number) => {
    if (!window.confirm((admin.deleteMessageConfirm as string) || "Delete?")) return;
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk("Comment deleted.");
      await load();
    } catch { setErr("Failed to delete comment."); }
  };

  return (
    <section className="border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{admin.blogComments}</h3>
      {loading ? <p className="text-text-muted">Loading…</p> : comments.length === 0 ? <p className="text-text-muted">No blog comments.</p> : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-border/50 pb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-text-primary">{c.author_name}</span>
                <span className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${c.is_approved ? "border-ok bg-ok/10 text-ok" : "border-accent bg-accent/10 text-accent"}`}>{c.is_approved ? "Approved" : "Pending"}</span>
              </div>
              <p className="text-sm text-text-muted mb-2">{c.content}</p>
              <p className="text-xs text-text-muted">{admin.by} {c.post_title || "Post #" + c.post_id}</p>
              <div className="flex gap-2">
                <button onClick={() => approve(c.id, true)} disabled={c.is_approved === 1} className="text-xs text-primary hover:underline mr-2">Approve</button>
                <button onClick={() => approve(c.id, false)} className="text-xs text-accent hover:underline mr-2">Reject</button>
                <button onClick={() => delComment(c.id)} className="text-xs text-text-muted hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}