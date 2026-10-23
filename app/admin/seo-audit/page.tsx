"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logger } from "@/lib/core/logger";

interface PageCheck {
  path: string;
  title: boolean;
  description: boolean;
  canonical: boolean;
  ogImage: boolean;
  jsonLd: boolean;
  hreflang: boolean;
  status: "ok" | "warning" | "error";
}

export default function SeoAuditPage() {
  const router = useRouter();
  const [unauthorized, setUnauthorized] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<PageCheck[]>([]);

  const pages = [
    "/",
    "/about",
    "/services",
    "/blog",
    "/booking",
    "/contact",
    "/forum",
    "/blog/1",
    "/forum/1",
  ];

  useEffect(() => {
    if (unauthorized) {
      router.replace("/admin/login");
    }
  }, [unauthorized, router]);

  const runAudit = async () => {
    setChecking(true);
    setResults([]);

    try {
      // First check auth
      const authRes = await fetch("/api/admin/stats");
      if (authRes.status === 401) {
        setUnauthorized(true);
        setChecking(false);
        return;
      }

      const pageResults: PageCheck[] = [];

      for (const path of pages) {
        try {
          const res = await fetch(path, { method: "GET" });
          const html = await res.text();

          const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
          const hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
          const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
          const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*content=["'][^"']+["']/i.test(html);
          const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
          const hasHreflang = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["']/i.test(html);

          const checks = [
            hasTitle,
            hasDescription,
            hasCanonical,
            hasOgImage,
            hasJsonLd,
            hasHreflang,
          ];
          const failedCount = checks.filter((c) => !c).length;

          pageResults.push({
            path,
            title: hasTitle,
            description: hasDescription,
            canonical: hasCanonical,
            ogImage: hasOgImage,
            jsonLd: hasJsonLd,
            hreflang: hasHreflang,
            status:
              failedCount === 0
                ? "ok"
                : failedCount <= 2
                ? "warning"
                : "error",
          });
        } catch {
          pageResults.push({
            path,
            title: false,
            description: false,
            canonical: false,
            ogImage: false,
            jsonLd: false,
            hreflang: false,
            status: "error",
          });
        }
      }

      setResults(pageResults);
    } catch (error) {
      logger.error("Audit failed", { error: error });
    } finally {
      setChecking(false);
    }
  };

  const statusBadge = {
    ok: { label: "✅ کامل", className: "bg-green-100 text-green-700" },
    warning: { label: "⚠️ نیاز به بررسی", className: "bg-amber-100 text-amber-700" },
    error: { label: "❌ مشکل", className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fill text-lg font-bold text-white">
              S
            </span>
            <div>
              <h1 className="text-lg font-bold text-text-primary">
                SEO / GEO Audit
              </h1>
              <p className="text-xs text-muted">
                بررسی وضعیت بهینه‌سازی صفحات
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-gray-200"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              بررسی تکنیکال SEO
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              بررسی موارد: Title، Description، Canonical، OG Image، JSON-LD، Hreflang
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={checking}
            className="rounded-lg bg-primary-fill px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-fill-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "در حال بررسی..." : "شروع بررسی"}
          </button>
        </div>

        {results.length === 0 && !checking && (
          <div className="rounded-3xl border border-dashed border-border bg-white p-16 text-center">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-lg text-text-secondary">
              برای شروع بررسی صفحات، دکمه «شروع بررسی» را بزنید
            </p>
          </div>
        )}

        {checking && (
          <div className="rounded-3xl border border-border bg-white p-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-primary" />
            <p className="mt-4 text-text-secondary">در حال بررسی صفحات...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-left">
                  <th className="px-6 py-4 font-semibold text-text-primary">صفحه</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">Title</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">Description</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">Canonical</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">OG Image</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">JSON-LD</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">Hreflang</th>
                  <th className="px-4 py-4 font-semibold text-text-primary">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {results.map((page) => (
                  <tr key={page.path} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        {page.path}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{page.title ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">{page.description ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">{page.canonical ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">{page.ogImage ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">{page.jsonLd ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">{page.hreflang ? "✅" : "❌"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[page.status].className}`}
                      >
                        {statusBadge[page.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}