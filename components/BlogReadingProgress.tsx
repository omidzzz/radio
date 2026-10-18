"use client";

import { useRef } from "react";
import { siteConfig } from "@/lib/seo";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

interface BlogReadingProgressProps {
  title: string;
  url: string;
  isRtl?: boolean;
}

const RING_RADIUS = 15;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Floating reading-progress widget.
 *
 * Performance notes:
 * - Scroll updates are rAF-throttled (max one update per frame).
 * - All visual updates are written directly to the DOM via refs —
 *   React state is never touched during scrolling, so there are
 *   zero re-renders while reading.
 * - Visibility and "near end" states are toggled with CSS classes.
 */
export default function BlogReadingProgress({
  title,
  url,
  isRtl = false,
}: BlogReadingProgressProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);

  // rAF-throttled scroll updates with zero React re-renders
  useScrollProgress(({ scrollTop, progress }) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`;
    }
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(
        RING_CIRCUMFERENCE * (1 - progress),
      );
    }
    if (pctRef.current) {
      pctRef.current.textContent = `${Math.round(progress * 100)}%`;
    }
    if (wrapRef.current) {
      wrapRef.current.classList.toggle("rp-visible", scrollTop > 300);
      wrapRef.current.classList.toggle("rp-near-end", progress > 0.9);
    }
  });

  const side = isRtl ? "left-4" : "right-4";
  const fullUrl = `${siteConfig.url}${url}`;

  // Positioned below the sticky navbar; pushed further down on desktop
  // where the navbar grows taller (stacked theme/language toggles).
  return (
    <div
      ref={wrapRef}
      className={`reading-widget fixed top-20 z-40 min-[1220px]:top-28 ${side}`}
    >
      <div className="flex items-center gap-3 rounded-full border border-primary/25 bg-deep/90 px-4 py-2 shadow-[0_8px_30px_-8px_rgba(26,115,82,0.4)] backdrop-blur-md">
        {/* Circular progress ring */}
        <div className="relative h-9 w-9" role="progressbar" aria-label="Reading progress">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2.5"
            />
            <circle
              ref={ringRef}
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#rp-ring-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
              className="transition-[stroke-dashoffset] duration-100 ease-out"
            />
            <defs>
              <linearGradient id="rp-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c9b7a" />
                <stop offset="100%" stopColor="#2e7d5b" />
              </linearGradient>
            </defs>
          </svg>
          <span
            ref={pctRef}
            className="absolute inset-0 flex items-center justify-center font-mono text-[8px] tracking-wider text-highlight"
          >
            0%
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="relative h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            ref={barRef}
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary ${
              isRtl ? "origin-right" : "origin-left"
            }`}
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-1.5 border-s border-white/10 ps-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/40"
            aria-label="Share on WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 transition-colors hover:bg-sky-500/40"
            aria-label="Share on Telegram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>

          {/* Back to top — appears once the reader is near the end */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rp-back-to-top flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary/40"
            aria-label="Back to top"
            title="بازگشت به بالا"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              className="h-3.5 w-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}