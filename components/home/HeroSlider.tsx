"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import Hero from "@/components/home/Hero";
import HeroSlideTwo from "@/components/home/HeroSlideTwo";
import MriMachineIllustration from "@/components/ui/MriMachineIllustration";

interface HeroSliderProps {
  dict: Dictionary;
  isFa: boolean;
}

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

  return (
    <div
      className="relative grid"
      role="region"
      aria-roledescription={isFa ? "اسلایدر" : "carousel"}
      aria-label={isFa ? "معرفی خدمات و مراقبت" : "Care and services introduction"}
    >
      {SLIDES.map(({ id, Component }, i) => (
        <div
          key={id}
          className={`[grid-area:1/1] transition-opacity duration-[800ms] ease-in-out ${
            active === i ? "opacity-100" : "hidden"
          }`}
          aria-hidden={active !== i}
          role="group"
          aria-roledescription={isFa ? "اسلاید" : "slide"}
          aria-label={`${i + 1} ${isFa ? "از" : "of"} ${SLIDE_COUNT}`}
        >
          <Component
            dict={dict}
            isFa={isFa}
            playAnim={active === i}
          />
        </div>
      ))}

      {/* Animated MRI scanner — subtle background texture, visible on all slides */}
      <div className="pointer-events-none absolute top-0 right-0 z-0 hidden lg:block h-full w-full opacity-[0.12]">
        <MriMachineIllustration className="absolute top-[15%] right-[15%] h-[280px] w-[280px]" />
      </div>

      {/* Navigation controls */}
      <SliderControls
        active={active}
        count={SLIDE_COUNT}
        isFa={isFa}
        setActive={setActive}
      />
    </div>
  );
}

function SliderControls({
  active,
  count,
  isFa,
  setActive,
}: {
  active: number;
  count: number;
  isFa: boolean;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}) {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return (
    <>
      {/* Arrows */}
      <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-30 hidden items-center justify-between sm:flex">
        <button
          type="button"
          onClick={() => setActive((active - 1 + count) % count)}
          aria-label={isFa ? "اسلاید قبلی" : "Previous slide"}
          className="slider-nav-arrow group pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-surface text-text-primary transition-all duration-300 hover:border-text-primary hover:bg-text-primary hover:text-surface active:scale-95"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ease-out group-hover:-translate-x-0.5 ${isFa ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" d="M15 19l-7-7 7-7" />
            <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" opacity="0.45" d="M19 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setActive((active + 1) % count)}
          aria-label={isFa ? "اسلاید بعدی" : "Next slide"}
          className="slider-nav-arrow group pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-surface text-text-primary transition-all duration-300 hover:border-text-primary hover:bg-text-primary hover:text-surface active:scale-95"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 ${isFa ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" d="M9 5l7 7-7 7" />
            <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" opacity="0.45" d="M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scroll cue — desktop/tablet only (on mobile the sticky booking
          bar owns the bottom edge). Static hairline + chevron: zero cost. */}
      <div
        className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        aria-hidden="true"
      >
        <span className="h-8 w-px bg-gradient-to-b from-transparent via-slate-400/50 to-transparent" />
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
            onClick={() => setActive(i)}
            aria-label={`${isFa ? "اسلاید" : "Go to slide"} ${i + 1}`}
            aria-current={active === i}
            aria-pressed={active === i}
            className="group relative flex h-11 w-11 items-center justify-center"
          >
            <span
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                active === i
                  ? "slider-nav-dot-active w-6 bg-primary"
                  : "slider-nav-dot h-2 w-2 bg-border/30 group-hover:bg-border/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div
        className="tnum absolute bottom-6 right-6 z-30 hidden items-center gap-1 font-mono text-[11px] tracking-widest text-text-secondary sm:flex"
        dir="ltr"
      >
        <span className="text-text-primary">
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
