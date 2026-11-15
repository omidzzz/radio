"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/types";

interface BlogTabProps {
  posts: BlogPost[];
  loading: boolean;
  onEdit: (id: number) => void;
}

export default function BlogTab({ posts, loading, onEdit }: BlogTabProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = !search ||
      (p.titleFA && p.titleFA.toLowerCase().includes(search.toLowerCase())) ||
      (p.titleEN && p.titleEN.toLowerCase().includes(search.toLowerCase())) ||
      (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === "all" || (filterStatus === "published" ? p.isPublished : !p.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="border border-border rounded-xl overflow-hidden bg-surface">
      <div className="flex flex-wrap gap-3 p-4 border-b border-border bg-surface/50">
        <div className="flex-1 min-w-[200px]">
          <label className="sr-only">Search posts</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilterStatus("all")} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition bg-surface text-text-secondary hover:bg-accent border-border">All</button>
          <button onClick={() => setFilterStatus("published")} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition bg-surface text-text-secondary hover:bg-accent border-border">Published</button>
          <button onClick={() => setFilterStatus("draft")} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition bg-surface text-text-secondary hover:bg-accent border-border">Draft</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Created</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-secondary">Views</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={7} className="py-8 text-center text-text-muted">Loading posts...</td></tr>
            ) : filteredPosts.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-text-muted">{posts.length === 0 ? "No blog posts yet." : "No posts match your filters."}</td></tr>
            ) : (
              filteredPosts.map((p) => (
                <tr key={p.id} className="border-b border-border/50 cursor-pointer transition hover:bg-accent/30" onClick={() => onEdit(p.id)}>
                  <td className="px-4 py-3 text-text-muted text-xs">#{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{p.titleFA || p.titleEN || p.slug}</span>
                      {p.isFeatured && <span className="text-xs text-primary">⭐</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{p.slug}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{p.categoryFA || p.categoryEN}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${p.isPublished ? "border-ok bg-ok/10 text-ok" : "border-accent bg-accent/10 text-accent"}`}>
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(p.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{p.views ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
