import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import MagneticButton from "@/components/ui/MagneticButton";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";
import SlideBackground from "@/components/slides/SlideBackground";

interface HeroSlideTwoProps {
  dict: Dictionary;
  isFa: boolean;
  /** When true, the slide plays its staged entrance animations. */
  playAnim?: boolean;
}

/**
 * Slide Two — "Care Journey" thesis.
 *
 * Structurally distinct from Slide One on purpose:
 *  - Visual sits LEFT, copy sits RIGHT (mirrored grid order)
 *  - One circular portrait instead of two stacked rectangles
 *  - A floating testimonial quote + rating badge replace the HUD/coordinate
 *    readouts — trust cues instead of technical cues
 *  - A two-stat trust strip replaces the three-icon feature grid
 *
 * Expected dict shape — dict.home.heroSlide2:
 *   badge, title1, title2, subtitle, ctaPrimary, ctaSecondary,
 *   quote, quoteAuthor, quoteAuthorRole,
 *   ratingValue, ratingCount, patientsCount, patientsLabel
 */
export default function HeroSlideTwo({
  dict,
  isFa,
  playAnim = true,
}: HeroSlideTwoProps) {
  const slide = dict.home.heroSlide2;

  return (
    <section
      className={`slide-entrance relative h-full min-h-[calc(100svh-4rem)] overflow-hidden bg-white text-slate-900 dark:bg-deep dark:text-text-primary sm:min-h-[96vh] ${
        playAnim ? "slide-active" : ""
      }`}
    >
      {/* Composable slide background — care variant */}
      <SlideBackground variant="care" className="lightbg-clip" />

      {/* Grain — same material treatment as slide one and the dark bands */}
      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      {/* (Care-team readouts — desktop only) — removed decorative HUD elements */}

      {/* Floating ambient orbs — desktop only */}

      <div className="relative z-10 mx-auto flex h-full min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 pb-24 pt-8 sm:min-h-[96vh] sm:px-6 sm:py-20 lg:px-8">
        <div className="grid w-full items-center gap-7 sm:gap-12 md:grid-cols-12 md:gap-8 lg:gap-10">
          {/* ── Left: circular portrait + trust overlays ── */}
          <div className="relative order-1 md:col-span-5 xl:col-span-7">
            <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl shadow-xl ring-1 ring-secondary/15 sm:aspect-[16/10] md:aspect-[4/5] md:rounded-2xl xl:aspect-square xl:max-w-md xl:overflow-visible xl:rounded-none xl:shadow-none xl:ring-0 xl:max-w-lg">
              {/* Concentric "care rings" centered on the portrait */}
              <div className="pointer-events-none absolute -inset-8 hidden rounded-full border border-slate-300/40 dark:border-secondary/15 anim-scale-in delay-500 xl:block" />
              <div className="pointer-events-none absolute -inset-16 hidden rounded-full border border-slate-300/30 dark:border-secondary/10 anim-scale-in delay-700 xl:block" />
              <div className="pointer-events-none absolute -inset-24 hidden rounded-full border border-slate-200/40 dark:border-primary/5 anim-scale-in delay-800 2xl:block" />

              {/* Circular portrait */}
              <div className="anim-scale-in delay-400 absolute inset-0 overflow-hidden rounded-xl transition-transform duration-500 will-change-transform md:rounded-2xl xl:rounded-full xl:shadow-2xl xl:shadow-secondary/20 xl:ring-4 xl:ring-white/10 xl:hover:scale-[1.02]">
                <Image
                  src="/images/home-consultation-circle.webp"
                  alt={isFa ? "مشاوره دلسوزانه با بیمار" : "Compassionate patient consultation"}
                  fill
                  sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) 38vw, 34vw"
                  loading="eager"
                  className="object-cover object-center"
                />
                <div className="pointer-events-none absolute left-1/2 top-1/3 h-14 w-14 -translate-x-1/2 -translate-y-1/2">
                  <span className="hud-pulse absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/70" />
                </div>
              </div>

              <div className="anim-fade-up delay-800 absolute -left-2 top-4 z-30 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-deep/90 px-4 py-3 shadow-xl backdrop-blur-sm dark:xl:flex xl:-left-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-secondary-hover">
                  <StarIcon />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none text-white">
                    {isFa ? toFarsiDigits(slide.ratingValue) : slide.ratingValue}
                  </div>
                  <div className="mt-1 text-[11px] leading-none text-muted">{slide.ratingCount}</div>
                </div>
              </div>

              <div className="anim-fade-up delay-1000 absolute -bottom-2 -right-4 z-30 hidden w-[78%] max-w-xs rounded-2xl border border-white/15 bg-deep/90 p-4 shadow-2xl shadow-deep/60 backdrop-blur-sm dark:xl:block xl:-right-8 xl:w-[70%]">
                <svg className="h-5 w-5 text-secondary/50" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.5 8C6.5 8 4 10.5 4 13.5S6.5 19 9.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C13.5 10.5 12.5 8 9.5 8zm10 0c-3 0-5.5 2.5-5.5 5.5S16.5 19 19.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C23.5 10.5 22.5 8 19.5 8z" />
                </svg>
                <p className="mt-1.5 text-[13px] leading-snug text-white/90">{slide.quote}</p>
                <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/25 text-xs font-bold text-secondary-hover">
                    {slide.quoteAuthor?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-none text-white">{slide.quoteAuthor}</div>
                    <div className="mt-1 text-[11px] leading-none text-muted">{slide.quoteAuthorRole}</div>
                  </div>
                </div>
              </div>

              {/* Ambient accents */}
            </div>
          </div>

          {/* ── Right: compassionate copy ── */}
          <div className="order-2 md:col-span-7 xl:col-span-5">
            <div className="anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary-hover backdrop-blur-sm">
              <HeartIcon />
              {slide.badge}
            </div>

            <h2 className="anim-fade-up delay-300 fluid-display mt-5 font-black slide-main-heading text-shadow-lg sm:mt-7">
              {slide.title1}{" "}
              <span className="hero-title-accent shimmer-text drop-shadow-soft">
                {slide.title2}
              </span>
            </h2>

            <div className="text-panel-sm inline-block rounded-xl px-4 py-2 anim-fade-up delay-400 mt-6 max-w-lg">
              <p className="text-lg leading-relaxed text-black/85 dark:text-white/90 text-shadow-sm">{slide.subtitle}</p>
            </div>

            <div className="anim-fade-up delay-500 mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <MagneticButton
                as={Link}
                href="/about"
                strength={0.2}
                className="conic-border rounded-full"
              >
                <span className="group relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full bg-secondary px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_45px_-6px_rgba(46,125,91,0.75)] transition-colors duration-300 hover:bg-primary-hover dark:bg-button-fill dark:text-button-text dark:hover:bg-button-fill-hover active:scale-[0.97] sm:w-auto sm:px-8">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    {slide.ctaPrimary}
                  </span>
                </span>
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/contact"
                strength={0.2}
                className="inline-block"
              >
                <span className="group inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-primary bg-surface px-6 py-3 text-text-primary shadow-sm transition-colors duration-300 hover:bg-primary hover:text-white dark:border-primary/50 dark:bg-surface dark:hover:bg-button-fill-hover dark:hover:text-button-text active:scale-[0.97] sm:w-auto backdrop-blur-sm btn-shadow-light">
                  {slide.ctaSecondary}
                </span>
              </MagneticButton>
            </div>

            <div className="anim-fade-up delay-600 mt-8 flex flex-wrap items-center gap-5 border-t border-border/60 pt-6 sm:mt-12 sm:gap-8 sm:pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary-hover"><UsersIcon /></div>
                <div>
                  <div className="text-xl font-bold leading-none text-text-primary sm:text-2xl">
                    <CountUp end={parseInt(slide.patientsCount, 10) || 0} suffix="+" useFarsiDigits={isFa} />
                  </div>
                  <div className="mt-1 text-xs text-text-secondary sm:text-sm">{slide.patientsLabel}</div>
                </div>
              </div>
              <div className="h-10 w-px bg-border/60" />
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary-hover"><StarIcon /></div>
                <div>
                  <div className="text-xl font-bold leading-none text-text-primary sm:text-2xl">
                    {isFa ? toFarsiDigits(slide.ratingValue) : slide.ratingValue}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary sm:text-sm">{slide.ratingCount}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <HeroBottomDivider />
    </section>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function StarIcon() {
  return <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.26L21.8 9l-5 4.87L18.2 21 12 17.27 5.8 21l1.4-7.13-5-4.87 6.9-.74L12 2z" /></svg>;
}

function UsersIcon() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 100-8 4 4 0 000 8z" /></svg>;
}
