"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog-html";

interface TableOfContentsProps {
  items: TocItem[];
  isFa?: boolean;
}

/**
 * Sticky table of contents with scroll-spy highlighting.
 * Rendered as a sticky sidebar on large screens and a collapsible
 * <details> block on smaller screens (handled by the parent layout).
 */
export default function TableOfContents({ items, isFa = false }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost heading currently in view
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={isFa ? "فهرست مطالب" : "Table of contents"}>
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4 text-primary"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
        {isFa ? "فهرست مطالب" : "On this page"}
      </p>
      <ul className="space-y-1 border-s border-border/70">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`-ms-px block border-s-2 py-1.5 text-sm leading-snug transition-colors ${
                item.level === 3 ? "ps-7" : "ps-4"
              } ${
                activeId === item.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}