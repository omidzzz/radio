"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "../providers/LocaleProvider";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import type { SearchResult, SearchCategory } from "@/lib/services/search-service";

interface GroupedResults {
  page: SearchResult[];
  blog: SearchResult[];
  forum: SearchResult[];
}

const EMPTY_GROUP: GroupedResults = { page: [], blog: [], forum: [] };

const CATEGORY_META: Record<SearchCategory, { label: string; icon: string; color: string }> = {
  page: { label: "صفحه", icon: "📄", color: "text-primary" },
  blog: { label: "مقاله", icon: "📝", color: "text-secondary" },
  forum: { label: "انجمن", icon: "💬", color: "text-amber-500" },
};

export default function SearchDropdown({
  autoFocus = false,
  onNavigate,
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const isFa = locale === "fa";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedResults>(EMPTY_GROUP);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Flatten results for keyboard navigation
  const flatResults = useCallback((): SearchResult[] => {
    return [...results.page, ...results.blog, ...results.forum];
  }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Fetch search results with debounce
  const fetchResults = useCallback(
    async (term: string) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6&pages=true`, {
          signal: controller.signal,
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          setError(true);
          setResults(EMPTY_GROUP);
          return;
        }

        const data = await res.json();
        setResults({
          page: data.grouped?.page || [],
          blog: data.grouped?.blog || [],
          forum: data.grouped?.forum || [],
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(true);
          setResults(EMPTY_GROUP);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced input handler
  const handleInput = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults(EMPTY_GROUP);
      setOpen(false);
      setLoading(false);
      return;
    }

    setOpen(true);
    debounceRef.current = setTimeout(() => {
      fetchResults(value.trim());
    }, 250);
  };

  // Navigate to search page on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = flatResults();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length > 0) {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length > 0) {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        // Navigate to selected result
        if (onNavigate) onNavigate();
        router.push(items[activeIndex].url);
      } else if (query.trim().length >= 2) {
        // Navigate to search page
        if (onNavigate) onNavigate();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleResultClick = () => {
    setOpen(false);
    setActiveIndex(-1);
    if (onNavigate) onNavigate();
  };

  // Autofocus input when rendered inside overlay
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const totalCount = flatResults().length;
  const hasResults = totalCount > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          placeholder={isFa ? "جستجو..." : "Search..."}
          aria-label={isFa ? "جستجو" : "Search"}
          aria-expanded={open}
          aria-controls="search-dropdown"
          className="w-40 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-muted backdrop-blur-sm transition-all duration-300 focus:w-56 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-44 md:focus:w-60"
          dir={isFa ? "rtl" : "ltr"}
        />
        {/* Search icon */}
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-muted">
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          )}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id="search-dropdown"
          className="absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-primary/20 bg-deep/98 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:w-96"
          role="listbox"
          aria-label={isFa ? "نتایج جستجو" : "Search results"}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-xs font-medium text-muted">
              {isFa ? "نتایج جستجو" : "Search results"}
            </span>
            {hasResults && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {isFa ? toFarsiDigits(totalCount) : totalCount}
              </span>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isFa ? "در حال جستجو..." : "Searching..."}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="px-4 py-8 text-center text-sm text-red-400">
              {isFa ? "خطا در جستجو. دوباره تلاش کنید." : "Search failed. Please try again."}
            </div>
          )}

          {/* No results */}
          {!loading && !error && query.trim().length >= 2 && !hasResults && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              {isFa ? "نتیجه‌ای یافت نشد" : "No results found"}
            </div>
          )}

          {/* Results grouped by category */}
          {!loading && !error && hasResults && (
            <div className="max-h-80 overflow-y-auto">
              {(["page", "blog", "forum"] as SearchCategory[]).map((cat) => {
                const items = results[cat];
                if (items.length === 0) return null;

                const meta = CATEGORY_META[cat];
                const label = isFa
                  ? cat === "page" ? "صفحات" : cat === "blog" ? "مقالات" : "انجمن"
                  : cat === "page" ? "Pages" : cat === "blog" ? "Blog" : "Forum";

                return (
                  <div key={cat} className="border-b border-white/5 last:border-0">
                    {/* Category header */}
                    <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        {label}
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] text-muted/60">
                        {isFa ? toFarsiDigits(items.length) : items.length}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="py-1">
                      {items.map((item, idx) => {
                        const flatIdx = flatResults().indexOf(item);
                        const isActive = flatIdx === activeIndex;

                        return (
                          <Link
                            key={item.id}
                            href={item.url}
                            onClick={handleResultClick}
                            onMouseEnter={() => setActiveIndex(flatIdx)}
                            className={`block px-4 py-2.5 transition-colors duration-150 ${
                              isActive ? "bg-primary/15" : "hover:bg-white/[0.06]"
                            }`}
                            role="option"
                            aria-selected={isActive}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`mt-0.5 text-sm ${meta.color}`}>{meta.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-white">
                                    {item.title}
                                  </span>
                                  {item.category && (
                                    <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-muted">
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                                {item.context && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                                    {item.context}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer — go to search page */}
          {query.trim().length >= 2 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={handleResultClick}
              className="flex items-center justify-center gap-2 border-t border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-gold transition-colors hover:bg-primary/10"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              {isFa ? "مشاهده همه نتایج" : "View all results"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}