"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogPostSummary } from "@/lib/types/blog";
import type { Locale } from "@/lib/i18n/config";
import BlogPostCard from "./BlogPostCard";

const PAGE_SIZE = 6;

/** Filtering happens against summaries only, so exported HTML needs no API. */
export default function BlogListing({ posts, locale }: { posts: BlogPostSummary[]; locale: Locale }) {
  const fa = locale === "fa";
  const [livePosts, setLivePosts] = useState(posts);
  const [liveStatus, setLiveStatus] = useState<"loading" | "ready" | "error">("loading");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  useEffect(() => {
    let active = true;
    fetch("/api/get_posts.php", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Blog posts unavailable");
        return response.json();
      })
      .then((rows: Array<Record<string, unknown>>) => {
        if (!active || !Array.isArray(rows)) return;
        setLivePosts(rows.map((row, index) => {
          const translations = row.translations as Record<string, Record<string, unknown>> | undefined;
          const faContent = translations?.fa ?? {};
          const enContent = translations?.en ?? {};
          const image = row.featuredImage as { src?: string } | undefined;
          const id = Number(row.id);
          const publishedAt = typeof row.date === "string" && row.date ? new Date(row.date.replace(" ", "T") + (row.date.endsWith("Z") ? "" : "Z")).toISOString() : undefined;
          return {
            id: Number.isFinite(id) && id > 0 ? id : index + 1,
            slug: typeof row.slug === "string" ? row.slug : undefined,
            titleFA: String(faContent.title || row.title || ""),
            titleEN: String(enContent.title || "") || undefined,
            excerptFA: String(faContent.excerpt || ""),
            excerptEN: String(enContent.excerpt || "") || undefined,
            authorFA: String(row.author || "تحریریه"),
            authorEN: String(row.author || "Editorial team"),
            categoryFA: String(row.category || "مقالات آموزشی"),
            categoryEN: String(row.category || "Educational articles"),
            image: image?.src || undefined,
            readMinutes: Math.max(1, Number(row.readMinutes) || 1),
            publishedAt,
            views: Number(row.views) || undefined,
          };
        }));
        setLiveStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setLivePosts([]);
        setLiveStatus("error");
      });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      setCategory(params.get("category") || "all");
      setPage(Math.max(1, Number(params.get("page")) || 1));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const categories = useMemo(() => [...new Map(livePosts.map((post) => [post.categoryFA, fa ? post.categoryFA : post.categoryEN || post.categoryFA])).entries()], [livePosts, fa]);
  const filtered = livePosts.filter((post) => category === "all" || post.categoryFA === category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(Math.floor(page), totalPages);
  const visible = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const select = (nextCategory: string, nextPage: number) => {
    setCategory(nextCategory);
    setPage(nextPage);
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    window.history.pushState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  };
  return <div>
    <div role="group" aria-label={fa ? "دسته‌بندی مقالات" : "Article categories"} className="mb-8 flex flex-wrap gap-2">
      {[["all", fa ? "همه" : "All"], ...categories].map(([value, label]) => <button key={value} type="button" aria-pressed={category === value} className={`ui-button ui-button-filter px-4 py-2 text-sm ${category === value ? "is-active" : ""}`} onClick={() => select(value, 1)}>{label}</button>)}
    </div>
    <p aria-live="polite" className="mb-6 text-sm text-muted">{liveStatus === "loading" ? (fa ? "در حال بارگذاری مقاله‌ها…" : "Loading articles…") : liveStatus === "error" ? (fa ? "دریافت مقاله‌ها از پایگاه داده ممکن نیست." : "Could not load articles from the database.") : `${new Intl.NumberFormat(locale).format(filtered.length)} ${fa ? "مقاله" : "articles"}`}</p>
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2">{visible.length ? visible.map((post, i) => <div key={post.id} className={`w-full ${activePage === 1 && i === 0 ? "md:col-span-2" : ""}`}><BlogPostCard post={post} isFa={fa} eager={i < 2} featured={activePage === 1 && i === 0} /></div>) : <p className="text-muted">{fa ? "مقاله‌ای در این دسته‌بندی یافت نشد." : "No articles in this category."}</p>}</div>
    {totalPages > 1 && <nav className="mt-10 flex flex-wrap items-center justify-center gap-4" aria-label={fa ? "صفحه‌بندی" : "Pagination"}>
      <button type="button" className="ui-button ui-button-ghost" disabled={activePage === 1} onClick={() => select(category, activePage - 1)}>{fa ? "قبلی" : "Previous"}</button>
      <span className="text-sm text-muted" aria-live="polite">{new Intl.NumberFormat(locale).format(activePage)} / {new Intl.NumberFormat(locale).format(totalPages)}</span>
      <button type="button" className="ui-button ui-button-ghost" disabled={activePage === totalPages} onClick={() => select(category, activePage + 1)}>{fa ? "بعدی" : "Next"}</button>
    </nav>}
    <noscript><p>{fa ? "برای دیدن همه مقاله‌ها بدون جاوااسکریپت، پیوندهای زیر را دنبال کنید." : "Without JavaScript, all article links are available below."}</p><ul>{posts.map((post) => <li key={post.id}><a href={`/${locale}/blog/${post.slug || post.id}/`}>{fa ? post.titleFA : post.titleEN || post.titleFA}</a></li>)}</ul></noscript>
  </div>;
}