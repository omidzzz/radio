"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TocItem } from "@/lib/utils/blog-html";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { CloseIcon } from "@/components/ui/icons";

export interface TableOfContentsProps {
  /** TOC items extracted from h2/h3 headings */
  items: TocItem[];
  /** Labels language (Farsi when true) */
  isFa?: boolean;
  /** Show reading progress bar at the top of the nav */
  showProgress?: boolean;
  /** Show "01, 02…" numbers on h2 items */
  showNumbers?: boolean;
  /** Extra className forwarded to the outer wrapper */
  className?: string;
}

/** Estimated reading speed: ~1100 characters per minute (~200 wpm) */
const CHARS_PER_MIN = 1100;

function estimateReadTime(text: string, isFa: boolean): string {
  const minutes = Math.max(1, Math.ceil(text.length / CHARS_PER_MIN));
  return isFa ? `${minutes} دق` : `${minutes} min`;
}

/**
 * Premium table-of-contents nav.
 *
 * Rendered in two places by BlogArticle:
 *  - desktop sticky sidebar (`.article-sidebar`)
 *  - mobile collapsible `<details>` block (`.article-toc`)
 *
 * Features:
 *  - Numbered h2 items + indented h3 items
 *  - IntersectionObserver scroll-spy (topmost visible heading wins)
 *  - Thin reading-progress bar (rAF-throttled, zero React re-renders)
 *  - Direction-aware active indicator (border-inline-start)
 *  - Theme-aware via existing CSS variables; light + dark safe
 *  - Fade-in entrance, subtle hover transitions, reduced-motion safe
 *  - Keyboard accessible + ARIA attributes
 */
export function TableOfContents({
  items,
  isFa = false,
  showProgress = true,
  showNumbers = true,
  className,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const progressRef = useRef<HTMLDivElement | null>(null);

  // ---- Scroll-spy: highlight the section currently in view ----
  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0% -65% 0%", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  // ---- Reading progress (writes to DOM via ref, zero re-renders) ----
  useScrollProgress(({ progress }) => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    }
  });

  const handleItemClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      e.preventDefault();
      history.replaceState(null, "", `#${id}`);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
      setActiveId(id);
    },
    [],
  );

  const h2Counter = useMemo(() => {
    let n = 0;
    return items.map((item) => {
      if (item.level === 2) n += 1;
      return item.level === 2 ? n : null;
    });
  }, [items]);

  if (items.length === 0) return null;

  const title = isFa ? "فهرست مطالب" : "On this page";
  const ariaLabel = isFa ? "فهرست مطالب این صفحه" : "Table of contents";

  return (
    <nav aria-label={ariaLabel} className={`toc-nav ${className ?? ""}`}>
      <div className="toc-wrap">
        {/* Header */}
        <div className="toc-header">
          <span className="toc-eyebrow" aria-hidden="true">{title}</span>
        </div>

        {/* Reading progress bar */}
        {showProgress && (
          <div className="toc-progress-wrapper">
            <div
              ref={progressRef}
              className="toc-progress-bar"
              style={{ transform: "scaleX(0)" }}
              aria-hidden="true"
            />
          </div>
        )}

        <ul className="toc-list">
          {items.map((item, index) => {
            const isH2 = item.level === 2;
            const h2Number = showNumbers && isH2 ? h2Counter[index] : null;
            const isActive = activeId === item.id;
            const readTime = isH2 ? estimateReadTime(item.text, isFa) : undefined;

            return (
              <li key={item.id} className="toc-item">
                <a
                  href={`#${item.id}`}
                  onClick={handleItemClick(item.id)}
                  className={`toc-link ${isH2 ? "toc-link-h2" : "toc-link-h3"} ${isActive ? "toc-link-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                >
                  {showNumbers && isH2 && h2Number != null && (
                    <span className="toc-number" aria-hidden="true">
                      {String(h2Number).padStart(2, "0")}
                    </span>
                  )}
                  <span className="toc-text">{item.text}</span>
                  {readTime && (
                    <span className="toc-reading-time" aria-hidden="true">{readTime}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Mobile FAB + bottom-sheet drawer containing the TOC.
 *
 * Rendered once by BlogArticle (outside the desktop sidebar / inline details)
 * so there is exactly one floating button on mobile. The sheet slides up from
 * the bottom and can be dismissed via the close button, the backdrop, or Esc.
 */
interface TableOfContentsSheetProps {
  items: TocItem[];
  isFa?: boolean;
}

export function TableOfContentsSheet({ items, isFa = false }: TableOfContentsSheetProps) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  const title = isFa ? "فهرست مطالب" : "On this page";
  const closeLabel = isFa ? "بستن" : "Close";

  const close = useCallback(() => setOpen(false), []);

  // Trap focus inside the sheet while open; dismiss on Esc
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, close]);

  // Move focus to the first focusable item inside the sheet when it opens
  useEffect(() => {
    if (!open || !sheetRef.current) return;
    const firstFocusable = sheetRef.current.querySelector<HTMLElement>('a[href], button');
    if (firstFocusable) firstFocusable.focus();
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      {/* FAB — bottom end corner, stacked above the existing floating widgets */}
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="toc-mobile-sheet"
        aria-label={title}
        className="toc-fab"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
          <path d="M19 21H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
        </svg>
        <span className="toc-fab-label">{title}</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="toc-backdrop" onClick={close} aria-hidden="true" />
      )}

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal={open}
        aria-label={title}
        className={`toc-sheet ${open ? "toc-sheet--open" : ""}`}
      >
        <div className="toc-sheet-panel">
          <div className="toc-sheet-header">
            <h2 className="toc-sheet-title">{title}</h2>
            <button type="button" onClick={close} aria-label={closeLabel} className="toc-sheet-close">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <TableOfContents items={items} isFa={isFa} showProgress={false} showNumbers className="toc-sheet-list" />
        </div>
      </div>
    </>
  );
}

