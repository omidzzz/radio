"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import Hero from "@/components/home/Hero";
import HeroSlideTwo from "@/components/home/HeroSlideTwo";

interface HeroSliderProps {
  dict: Dictionary;
  isFa: boolean;
}

const AUTO_ADVANCE_MS = 8000;

/**
 * Data-driven slide registry — add a new slide by appending an entry here.
 * The slider (arrows, dots, counter, autoplay) adapts automatically.
 */
const SLIDES = [
  { id: "tech", Component: Hero },
  { id: "care", Component: HeroSlideTwo },
] as const;

const SLIDE_COUNT = SLIDES.length;

export default function HeroSlider({ dict, isFa }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Slides that currently play their staged entrance animations.
  // The outgoing slide keeps its state through the 800ms opacity
  // crossfade, then resets so the next activation replays cleanly.
  const [entranceSlides, setEntranceSlides] = useState<number[]>([0]);

  // Slide 2+ mounts lazily (deferred past LCP) so its images don't
  // compete with the first slide's priority hero image. It mounts
  // shortly after hydration so autoplay still works seamlessly.
  const [mountedSlides, setMountedSlides] = useState<number[]>([0]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMountedSlides((prev) =>
        prev.length === SLIDE_COUNT ? prev : Array.from({ length: SLIDE_COUNT }, (_, i) => i)
      );
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setEntranceSlides((prev) =>
      prev.includes(active) ? prev : [...prev, active]
    );
    const t = setTimeout(() => setEntranceSlides([active]), 900);
    return () => clearTimeout(t);
  }, [active]);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  const goToNext = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDE_COUNT);
  }, []);

  const goToPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timerRef.current = setTimeout(() => {
      goToNext();
    }, AUTO_ADVANCE_MS);
  }, [goToNext]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, resetTimer]);

  return (
    <div
      ref={containerRef}
      className="relative grid"
      onMouseEnter={() => timerRef.current && clearTimeout(timerRef.current)}
      onMouseLeave={resetTimer}
    >
      {SLIDES.map(({ id, Component }, i) => {
        const isMounted = mountedSlides.includes(i);
        if (!isMounted) return null;
        return (
          <div
            key={id}
            className={`[grid-area:1/1] transition-opacity duration-[800ms] ease-in-out ${
              active === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={active !== i}
            aria-live={active === i ? "polite" : undefined}
          >
            <Component
              dict={dict}
              isFa={isFa}
              playAnim={entranceSlides.includes(i)}
            />
          </div>
        );
      })}

      {/* Navigation controls */}
      <SliderControls
        active={active}
        count={SLIDE_COUNT}
        isFa={isFa}
        goTo={goTo}
        goToNext={goToNext}
        goToPrev={goToPrev}
        resetTimer={resetTimer}
      />
    </div>
  );
}

function SliderControls({
  active,
  count,
  isFa,
  goTo,
  goToNext,
  goToPrev,
  resetTimer,
}: {
  active: number;
  count: number;
  isFa: boolean;
  goTo: (i: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  resetTimer: () => void;
}) {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return (
    <>
      {/* Arrows */}
      <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-30 hidden items-center justify-between sm:flex">
        <button
          type="button"
          onClick={() => {
            goToPrev();
            resetTimer();
          }}
          aria-label={isFa ? "اسلاید قبلی" : "Previous slide"}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-deep/40 text-white backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-primary/20 hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] active:scale-95"
        >
          <svg
            className={`h-5 w-5 ${isFa ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            goToNext();
            resetTimer();
          }}
          aria-label={isFa ? "اسلاید بعدی" : "Next slide"}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-deep/40 text-white backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-primary/20 hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] active:scale-95"
        >
          <svg
            className={`h-5 w-5 ${isFa ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scroll cue — desktop/tablet only (on mobile the sticky booking
          bar owns the bottom edge). Static hairline + chevron: zero cost. */}
      <div
        className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        aria-hidden="true"
      >
        <span className="h-8 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <svg
          className="h-3.5 w-3.5 text-highlight/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Dots */}
      <div className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:bottom-[74px]">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            aria-label={`${isFa ? "اسلاید" : "Go to slide"} ${i + 1}`}
            aria-current={active === i}
            className="group relative flex h-6 w-6 items-center justify-center"
          >
            <span
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                active === i
                  ? "w-6 bg-primary shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  : "bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div
        className="tnum absolute bottom-6 right-6 z-30 hidden items-center gap-1 font-mono text-[11px] tracking-widest text-white/50 sm:flex"
        dir="ltr"
      >
        <span className="text-white/90">
          {isFa ? faDigits[active] : String(active + 1).padStart(2, "0")}
        </span>
        <span>/</span>
        <span>
          {isFa
            ? String(count).padStart(2, "0").replace(/\d/g, (d) => faDigits[Number(d)])
            : String(count).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}