import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServerDictionary } from "@/lib/i18n/server";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import { breadcrumbSchema } from "@/lib/json-ld";
import JsonLdScript from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHero from "@/components/PageHero";
import { searchAll } from "@/lib/services/search-service";
import type { SearchResult } from "@/lib/services/search-service";

export const metadata: Metadata = {
  title: "جستجو",
  description:
    "جستجو در مقالات تخصصی و انجمن گفتگوی کلینیک پرتودرمانی درباره پرتودرمانی، درمان سرطان و تصویربرداری پزشکی.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, { fa: string; en: string; icon: string }> = {
  page: { fa: "صفحه", en: "Page", icon: "📄" },
  blog: { fa: "مقاله", en: "Article", icon: "📝" },
  forum: { fa: "انجمن", en: "Forum", icon: "💬" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await getServerDictionary();
  const isFa = locale === "fa";
  const params = await searchParams;
  const q = (params.q || "").trim();

  let results: SearchResult[] = [];

  if (q && q.length >= 2) {
    try {
      const response = searchAll(q, { locale, limit: 20, includePages: true });
      results = response.results;
    } catch {
      // DB might not be ready
    }
  }

  const breadcrumbs = breadcrumbSchema([
    { name: "خانه", path: "/" },
    { name: "جستجو", path: "/search" },
  ]);

  return (
    <div className="min-h-screen bg-bg">
      <JsonLdScript data={breadcrumbs} />
      <Breadcrumbs
        items={[
          { name: "خانه", path: "/" },
          { name: "جستجو", path: "/search" },
        ]}
      />

      {/* Header — clean medical-tech hero */}
      <PageHero
        badge={isFa ? "جستجو" : "Search"}
        title={isFa ? "جستجو" : "Search"}
        subtitle={
          isFa
            ? "جستجو در مقالات، انجمن گفتگو و صفحات"
            : "Search articles, forum discussions, and pages"
        }
      >
        <form action="/search" method="GET" className="mt-8 max-w-xl">
          <div className="flex gap-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={isFa ? "جستجو..." : "Search..."}
              className="flex-1 border border-white/20 bg-white/10 px-6 py-3.5 text-white placeholder-muted backdrop-blur-sm focus:border-primary focus:outline-none"
              dir={isFa ? "rtl" : "ltr"}
            />
            <button
              type="submit"
              className="btn btn-primary px-8 py-3.5"
            >
              {isFa ? "جستجو" : "Search"}
            </button>
          </div>
        </form>
      </PageHero>

      {/* Results */}
      <section className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {q && (
          <h2 className="mono mb-8 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
            {isFa
              ? `${toFarsiDigits(results.length)} نتیجه برای "${q}"`
              : `${results.length} results for "${q}"`}
          </h2>
        )}

        {!q && (
          <div className="border border-dashed border-border bg-surface p-16 text-center">
            <p className="text-lg text-text-secondary">
              {isFa
                ? "عبارت جستجو را وارد کنید"
                : "Enter a search term to begin"}
            </p>
          </div>
        )}

        {q && results.length === 0 && (
          <div className="border border-dashed border-border bg-surface p-16 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-4 text-lg text-text-secondary">
              {isFa
                ? "نتیجه‌ای یافت نشد. عبارت دیگری را امتحان کنید."
                : "No results found. Try a different search term."}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => {
              const meta = CATEGORY_LABELS[result.type] || CATEGORY_LABELS.page;
              const typeLabel = isFa ? meta.fa : meta.en;

              return (
                <Link
                  key={result.id}
                  href={result.url}
                  className="surface-card group block p-6 transition-colors duration-300 hover:border-primary/40"
                >
                  <div className="flex items-start gap-4">
                    {result.type === "blog" && result.image && (
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-border">
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip">
                          <span>{meta.icon}</span>
                          {typeLabel}
                        </span>
                        {result.category && (
                          <span className="chip border-border text-muted">
                            {result.category}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-text-primary group-hover:text-primary">
                        {result.title}
                      </h3>
                      {result.context && (
                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                          {result.context}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}