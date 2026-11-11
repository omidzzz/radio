"use client";

import { useEffect, useState, useCallback } from "react";

interface BlogTabProps { admin: Record<string, any>; }

export default function BlogTab({ admin }: BlogTabProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead><tr className="text-left border-b border-border bg-surface/50">
            <th className="pb-3 text-sm font-semibold text-text-secondary">ID</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Title</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Slug</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Category</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Status</th>
            <th className="pb-3 text-sm font-semibold text-text-secondary">Created</th>
          </tr></thead>
          <tbody className="text-sm">
            {loading ? <tr><td colSpan={6} className="py-4 text-center text-text-muted">Loading…</td></tr> : posts.length === 0 ? <tr><td colSpan={6} className="py-4 text-center text-text-muted">No blog posts.</td></tr> : posts.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 transition">
                <td className="py-3 text-text-muted">#{p.id}</td>
                <td className="py-3 text-text-primary">{p.title_fa || p.title_en || p.title}</td>
                <td className="py-3 text-text-muted">{p.slug}</td>
                <td className="py-3 text-text-muted">{p.category_fa || p.category_en}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-semibold border ${p.is_published ? "border-ok bg-ok/10 text-ok" : "border-accent bg-accent/10 text-accent"}`}>{p.is_published ? "Published" : "Draft"}</span></td>
                <td className="py-3 text-text-muted">{p.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}