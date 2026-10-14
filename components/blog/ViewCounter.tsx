"use client";

import { useEffect, useState } from "react";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface ViewCounterProps {
  postId: number;
  initialViews: number;
  isFa?: boolean;
  className?: string;
}

function formatViews(views: number, isFa: boolean): string {
  if (views >= 1000) {
    const k = views / 1000;
    const formatted = k >= 10 ? Math.round(k).toString() : k.toFixed(1);
    return isFa
      ? `${toFarsiDigits(formatted.replace(".", "٫"))} هزار`
      : `${formatted}k`;
  }
  return isFa ? toFarsiDigits(views) : String(views);
}

/**
 * Displays a post's view count and records one view per browser session.
 * The increment happens client-side so statically generated pages stay fast.
 */
export default function ViewCounter({
  postId,
  initialViews,
  isFa = false,
  className = "",
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const storageKey = `blog-view-${postId}`;
    let recorded = false;
    try {
      recorded = sessionStorage.getItem(storageKey) === "1";
    } catch {
      // Storage unavailable — still record the view once per mount
    }
    if (recorded) return;

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage failures
    }

    const controller = new AbortController();
    fetch(`/api/blog/${postId}/views`, { method: "POST", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { views?: number } | null) => {
        if (data && typeof data.views === "number") setViews(data.views);
      })
      .catch(() => {
        // Non-critical — keep showing the server-rendered count
      });

    return () => controller.abort();
  }, [postId]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{formatViews(views, isFa)}</span>
    </span>
  );
}