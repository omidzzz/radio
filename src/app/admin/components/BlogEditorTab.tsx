"use client";

import { useState, useEffect, useCallback } from "react";

interface BlogEditorTabProps { admin: Record<string, any>; }
interface BlogPost {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  title: string;
  category_fa: string;
  category_en: string;
  excerpt_fa: string;
  excerpt_en: string;
  is_published: number;
  status: string;
  date: string;
  created_at: string;
  featured_image: string;
  tags: string[];
}

const CATEGORIES = [
  { value: "general", fa: "عمومی", en: "General" },
  { value: "treatment", fa: "درمان", en: "Treatment" },
  { value: "support", fa: "حمایت", en: "Support" },
  { value: "other", fa: "سایر", en: "Other" },
];

export default function BlogEditorTab({ admin }: BlogEditorTabProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    id: "",
    slug: "",
    title: "",
    title_en: "",
    title_fa: "",
    excerpt: "",
    excerpt_en: "",
    excerpt_fa: "",
    body: "",
    body_en: "",
    body_fa: "",
    html: "",
    html_en: "",
    html_fa: "",
    css: "",
    css_en: "",
    css_fa: "",
    kind: "article",
    category: "general",
    category_fa: "",
    category_en: "",
    status: "draft",
    date_published: "",
    featured_image: "",
    tags: "",
  });

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

  const resetForm = () => {
    setForm({
      id: "", slug: "", title: "", title_en: "", title_fa: "",
      excerpt: "", excerpt_en: "", excerpt_fa: "",
      body: "", body_en: "", body_fa: "",
      html: "", html_en: "", html_fa: "",
      css: "", css_en: "", css_fa: "",
      kind: "article", category: "general", category_fa: "", category_en: "",
      status: "draft", date_published: "", featured_image: "", tags: "",
    });
    setEditing(null);
  };

  const editPost = (post: BlogPost) => {
    setEditing(post);
    setForm({
      id: String(post.id),
      slug: post.slug,
      title: post.title,
      title_en: post.title_en,
      title_fa: post.title_fa,
      excerpt: post.excerpt_fa,
      excerpt_en: post.excerpt_en,
      excerpt_fa: post.excerpt_fa,
      body: post.excerpt_fa,
      body_en: post.excerpt_en,
      body_fa: post.excerpt_fa,
      html: "",
      html_en: "",
      html_fa: "",
      css: "",
      css_en: "",
      css_fa: "",
      kind: "article",
      category: post.category_fa || post.category_en || "general",
      category_fa: post.category_fa,
      category_en: post.category_en,
      status: post.status,
      date_published: post.date,
      featured_image: post.featured_image,
      tags: post.tags.join(", "),
    });
  };

  const savePost = async () => {
    if (!form.title) { setErr("Title is required."); return; }
    if (!form.slug) { setErr("Slug is required."); return; }

    const isCreate = !editing;
    try {
      const res = await fetch("/api/admin/blog", {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error || "Failed to save."); return; }
      await res.json();
      setOk(isCreate ? "Post created." : "Post updated.");
      resetForm();
      await load();
    } catch { setErr("Failed to save post."); }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      setOk("Post deleted.");
      await load();
    } catch { setErr("Failed to delete post."); }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{admin.blogPosts}</h2>
          <p className="text-xs text-text-muted">Manage blog posts create, edit, publish, or delete.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditing(null); }}
          className="rounded-lg bg-primary-fill px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-fill-hover transition"
        >
          {editing ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {err && <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{err}</div>}
      {ok && <div className="rounded-lg border border-positive/30 bg-positive-soft px-4 py-3 text-sm text-positive">{ok}</div>}

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">All Posts</h3>
        {loading ? <p className="text-text-muted">Loading...</p> : posts.length === 0 ? <p className="text-text-muted">No posts yet.</p> : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{p.title_fa || p.title_en || p.title}</span>
                    <span className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${p.is_published ? "border-ok bg-ok/10 text-ok" : "border-accent bg-accent/10 text-accent"}`}>
                      {p.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{p.slug} • {p.category_fa || p.category_en}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editPost(p)} className="text-xs text-primary hover:underline">Edit</button>
                  <button onClick={() => deletePost(p.id)} className="text-xs text-danger hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{editing ? "Edit Post" : "Create New Post"}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Title (FA)</label>
            <input type="text" value={form.title_fa} onChange={(e) => setForm({ ...form, title_fa: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Title (EN)</label>
            <input type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" placeholder="my-post-slug" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Publish Date</label>
            <input type="datetime-local" value={form.date_published} onChange={(e) => setForm({ ...form, date_published: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Excerpt (FA)</label>
            <textarea rows={2} value={form.excerpt_fa} onChange={(e) => setForm({ ...form, excerpt_fa: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Excerpt (EN)</label>
            <textarea rows={2} value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Body / Content (FA)</label>
            <textarea rows={4} value={form.body_fa} onChange={(e) => setForm({ ...form, body_fa: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Body / Content (EN)</label>
            <textarea rows={4} value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Featured Image URL</label>
            <input type="text" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" placeholder="tag1, tag2" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={savePost} disabled={loading} className="rounded-lg bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-fill-hover transition disabled:opacity-70">
            {editing ? "Update Post" : "Create Post"}
          </button>
          <button onClick={resetForm} className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm text-text-secondary hover:bg-accent transition">
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}


