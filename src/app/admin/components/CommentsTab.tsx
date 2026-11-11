"use client";

import { useEffect, useState, useCallback } from "react";

interface CommentsTabProps { admin: Record<string, any>; }
interface Comment { id: number; post_id: number; author_name: string; content: string; is_approved: number; created_at: string; post_title: string | null; }
interface ForumPost { id: number; author_name: string; title: string; content: string; category: string; created_at: string; reply_count: number; }

export default function CommentsTab({ admin }: CommentsTabProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/admin/comments?type=blog", { credentials: "include" }),
        fetch("/api/admin/comments?type=forum", { credentials: "include" }),
      ]);
      if (r1.ok) { const d = await r1.json(); setComments(d.comments || []); }
      if (r2.ok) { const d = await r2.json(); setForumPosts(d.posts || []); }
    } catch { setErr("Failed to load comments."); }
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

  const delForum = async (id: number) => {
    if (!window.confirm((admin.deletePostConfirm as string) || "Delete?")) return;
    try {
      const res = await fetch(`/api/admin/comments?id=${id}&type=forum`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setOk("Forum post deleted.");
      await load();
    } catch { setErr("Failed to delete forum post."); }
  };

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Blog Comments</h3>
        {loading ? <p className="text-text-muted">Loading…</p> : comments.length === 0 ? <p className="text-text-muted">No comments.</p> : (
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
      </div>
      <div className="border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Forum Posts</h3>
        {loading ? <p className="text-text-muted">Loading…</p> : forumPosts.length === 0 ? <p className="text-text-muted">No forum posts.</p> : (
          <ul className="space-y-3">
            {forumPosts.map((p) => (
              <li key={p.id} className="border-b border-border/50 pb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{p.title}</span>
                  <span className="text-xs text-text-muted">{p.author_name}</span>
                </div>
                <p className="text-sm text-text-muted mb-2">{p.content}</p>
                <p className="text-xs text-text-muted">{p.category} • {p.reply_count} replies</p>
                <button onClick={() => delForum(p.id)} className="text-xs text-text-muted hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}