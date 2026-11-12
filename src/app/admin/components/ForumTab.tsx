"use client";

import { useEffect, useState, useCallback } from "react";

interface ForumTabProps { admin: Record<string, any>; }
interface ForumPost { id: number; author_name: string; title: string; content: string; category: string; created_at: string; reply_count: number; }

export default function ForumTab({ admin }: ForumTabProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments?type=forum", { credentials: "include" });
      if (!res.ok) return;
      const d = await res.json();
      setPosts(d.posts || []);
    } catch { setErr("Failed to load forum posts."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const delPost = async (id: number) => {
    if (!window.confirm((admin.deletePostConfirm as string) || "Delete?")) return;
    try {
      const res = await fetch(`/api/admin/comments?id=${id}&type=forum`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk("Forum post deleted.");
      await load();
    } catch { setErr("Failed to delete forum post."); }
  };

  return (
    <section className="border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{admin.forumPosts}</h3>
      {loading ? <p className="text-text-muted">Loading…</p> : posts.length === 0 ? <p className="text-text-muted">No forum posts.</p> : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="border-b border-border/50 pb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">{p.title}</span>
                <span className="text-xs text-text-muted">{p.author_name}</span>
              </div>
              <p className="text-sm text-text-muted mb-2">{p.content}</p>
              <p className="text-xs text-text-muted">{p.category} • {p.reply_count} replies</p>
              <button onClick={() => delPost(p.id)} className="text-xs text-text-muted hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}