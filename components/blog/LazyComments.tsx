"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { BlogComment } from "@/lib/types";

const BlogComments = dynamic(() => import("@/components/feedback/BlogComments"));

interface LazyCommentsProps {
  postId: number;
  initialComments?: BlogComment[];
}

/**
 * Defers loading the comments section until it scrolls near the
 * viewport, keeping the article's initial hydration cost low.
 */
export default function LazyComments({ postId, initialComments = [] }: LazyCommentsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <BlogComments postId={postId} initialComments={initialComments} />
      ) : (
        <div aria-hidden="true">
          <div className="space-y-4 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-soft/40 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/70 bg-soft/30 p-5 sm:p-6">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            <div className="mt-5 space-y-4">
              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="h-10 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}