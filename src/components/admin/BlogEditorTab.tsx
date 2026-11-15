"use client";

import { useState, useEffect, useCallback } from "react";
import { useDictionary } from "@/lib/i18n/client";
import BlogEditor from "./BlogEditor";
import type { BlogPost } from "@/lib/types";

export default function BlogEditorTab() {
  const dict = useDictionary();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { setErr("Failed to load blog posts."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const selectedPost = posts.find((p) => p.id === editingId) || null;

  const handleSave = async (data: any) => {
    try {
      const isNew = !editingId;
      const endpoint = "/api/admin/blog";
      const method = isNew ? "POST" : "PATCH";
      const body = JSON.stringify(data);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save post.");
      }

      const result = await res.json();
      setOk(result.ok ? "Post saved." : "Post saved.");
      await load();
      if (result.post) {
        setEditingId(result.post.id);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to save post.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post.");
      setOk("Post deleted.");
      await load();
      if (editingId === id) setEditingId(null);
    } catch (e: any) {
      setErr(e.message || "Failed to delete post.");
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      // Note: duplicate isn't fully implemented yet; API route needs a proper POST handler.
      setOk("Duplicate feature pending.");
      await load();
    } catch (e: any) {
      setErr(e.message || "Failed to duplicate post.");
    }
  };

  const resetEditor = () => setEditingId(null);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}
      {ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{ok}</div>
      )}

      {/* Header: Title + New Post button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{dict.admin?.blogPosts || "Blog Posts"}</h2>
          <p className="text-xs text-text-muted">
            Manage blog posts — create, edit, publish, or delete.
          </p>
        </div>
        <button
          onClick={() => setEditingId(0)}
          className="rounded-lg bg-primary-fill px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-fill-hover transition"
        >
          + New Post
        </button>
      </div>

      {/* All Posts list */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">All Posts</h3>
        <div className="space-y-2">
          {loading ? (
            <div className="py-4 text-center text-text-muted">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="py-4 text-center text-text-muted">No blog posts yet.</div>
          ) : (
            posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {p.titleFA || p.titleEN || p.slug}
                  </span>
                  {p.isFeatured && <span className="text-xs text-primary">⭐</span>}
                  <span className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${
                    p.isPublished ? "border-ok bg-ok/10 text-ok" : "border-accent bg-accent/10 text-accent"
                  }`}>
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{p.slug}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(p.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit form */}
      {editingId === 0 || selectedPost ? (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            {editingId === 0 ? "Create New Post" : "Edit Post"}
          </h3>
          <BlogEditor
            post={selectedPost}
            loading={loading}
            onSave={handleSave}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onReset={resetEditor}
          />
        </div>
      ) : null}
    </div>
  );
}
