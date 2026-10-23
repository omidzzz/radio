import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import MagneticButton from "@/components/ui/MagneticButton";
import { toFarsiDigits } from "@/lib/i18n/numbers";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";

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
      className={`slide-entrance relative h-full min-h-[96vh] overflow-hidden bg-deep clip-path-lightbg ${
        playAnim ? "slide-active" : ""
      }`}
    >
      {/* Ambient background — identical stack to slide one so switching
          slides reads as one designed hero, not two different screens */}
      <div className="absolute inset-0 anim-fade-in">
        <Image
          src="/images/home-parallax.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center opacity-100 dark:opacity-0"
        />
      </div>

      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      {/* Hex lattice overlay — desktop only, matching slide one */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-[0.05] anim-fade-in delay-300 lg:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23c9a24b' stroke-width='0.6'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Care-lattice crosshair grid — desktop only */}
      <div className="planning-grid pointer-events-none absolute inset-0 hidden opacity-25 anim-fade-in delay-400 lg:block" />

      {/* Contour rings — desktop only */}
      <div className="pointer-events-none absolute right-[7%] top-[10%] hidden lg:block">
        <div className="isodose-ring isodose-ring-2 absolute h-40 w-40 rounded-full border border-secondary/20" />
        <div className="isodose-ring isodose-ring-3 absolute -inset-8 rounded-full border border-primary/15" />
        <div className="isodose-ring isodose-ring-4 absolute -inset-16 rounded-full border border-secondary/10" />
      </div>

      {/* Care-team readouts — desktop only */}
      <div className="coord-flash pointer-events-none absolute right-[4%] bottom-[24%] hidden font-mono text-[10px] tracking-widest text-secondary-hover/50 lg:block">
        CARE / 24·7&nbsp;&nbsp;TEAM / ON-CALL
      </div>
      <div
        className="coord-flash pointer-events-none absolute left-[4%] top-[12%] hidden font-mono text-[10px] tracking-widest text-primary-hover/40 lg:block"
        style={{ animationDelay: "1.2s" }}
      >
        JOURNEY / TOGETHER
      </div>

      {/* Floating ambient orbs — desktop only */}
      <div className="float-bob pointer-events-none absolute left-[6%] top-[42%] hidden h-56 w-56 rounded-full bg-secondary/12 blur-3xl anim-fade-in delay-400 lg:block" />
      <div className="float-bob float-bob-delay-1 pointer-events-none absolute right-[8%] top-[18%] hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl anim-fade-in delay-500 lg:block" />

      <div className="relative z-10 mx-auto flex h-full min-h-[96vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ── Left: circular portrait + trust overlays ── */}
          <div className="relative hidden lg:col-span-7 lg:block">
            <div className="relative mx-auto aspect-square max-w-md xl:max-w-lg">
              {/* Concentric "care rings" centered on the portrait */}
              <div className="pointer-events-none absolute -inset-8 rounded-full border border-secondary/15 anim-scale-in delay-500" />
              <div className="pointer-events-none absolute -inset-16 rounded-full border border-secondary/10 anim-scale-in delay-700" />
              <div className="pointer-events-none absolute -inset-24 rounded-full border border-primary/5 anim-scale-in delay-800 hidden xl:block" />

              {/* Circular portrait */}
              <div className="anim-scale-in delay-400 absolute inset-0 overflow-hidden rounded-full shadow-2xl shadow-secondary/20 ring-4 ring-white/10 transition-transform duration-500 will-change-transform hover:scale-[1.02]">
                <Image
                  src="/images/home-consultation-circle.webp"
                  alt={
                    isFa
                      ? "مشاوره دلسوزانه با بیمار"
                      : "Compassionate patient consultation"
                  }
                  fill
                  sizes="(max-width: 1024px) 0vw, 45vw"
                  className="object-cover object-center"
                />
                <div className="pointer-events-none absolute left-1/2 top-1/3 h-14 w-14 -translate-x-1/2 -translate-y-1/2">
                  <span className="hud-pulse absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/70" />
                </div>
              </div>

              {/* Rating badge — overlaps top-left of the circle */}
              <div className="anim-fade-up delay-800 absolute -left-2 top-4 z-30 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-deep/90 px-4 py-3 shadow-xl backdrop-blur-sm sm:-left-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-secondary-hover">
                  <StarIcon />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none text-white">
                    {isFa
                      ? toFarsiDigits(slide.ratingValue)
                      : slide.ratingValue}
                  </div>
                  <div className="mt-1 text-[11px] leading-none text-muted">
                    {slide.ratingCount}
                  </div>
                </div>
              </div>

              {/* Testimonial quote card — overlaps bottom-right of the circle */}
              <div className="anim-fade-up delay-1000 absolute -bottom-2 -right-4 z-30 w-[78%] max-w-xs rounded-2xl border border-white/15 bg-deep/90 p-4 shadow-2xl shadow-deep/60 backdrop-blur-sm sm:-right-8 sm:w-[70%]">
                <svg
                  className="h-5 w-5 text-secondary/50"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.5 8C6.5 8 4 10.5 4 13.5S6.5 19 9.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C13.5 10.5 12.5 8 9.5 8zm10 0c-3 0-5.5 2.5-5.5 5.5S16.5 19 19.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C23.5 10.5 22.5 8 19.5 8z" />
                </svg>
                <p className="mt-1.5 text-[13px] leading-snug text-white/90">
                  {slide.quote}
                </p>
                <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/25 text-xs font-bold text-secondary-hover">
                    {slide.quoteAuthor?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-none text-white">
                      {slide.quoteAuthor}
                    </div>
                    <div className="mt-1 text-[11px] leading-none text-muted">
                      {slide.quoteAuthorRole}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ambient accents */}
              <div className="float-bob pointer-events-none absolute -left-14 top-1/4 h-52 w-52 rounded-full bg-secondary/25 blur-3xl anim-fade-in delay-400" />
              <div className="float-bob float-bob-delay-1 pointer-events-none absolute -right-16 bottom-1/4 h-44 w-44 rounded-full bg-primary/15 blur-3xl anim-fade-in delay-500" />
            </div>
          </div>

          {/* ── Right: compassionate copy ── */}
          <div className="lg:col-span-5">
            <div className="anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary-hover backdrop-blur-sm">
              <HeartIcon />
              {slide.badge}
            </div>

            <h1 className="anim-fade-up delay-300 fluid-display mt-7 font-black text-white">
              {slide.title1}{" "}
              <span className="shimmer-text bg-gradient-to-r from-[#c9a24b] via-[#e8d5a3] to-[#c9a24b] bg-clip-text text-transparent">
                {slide.title2}
              </span>
            </h1>

            <p className="anim-fade-up delay-400 mt-6 max-w-lg text-lg leading-relaxed text-muted">
              {slide.subtitle}
            </p>

            <div className="anim-fade-up delay-500 mt-10 flex flex-wrap gap-4">
              <MagneticButton
                as={Link}
                href="/about"
                strength={0.2}
                className="conic-border rounded-full"
              >
                <span className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondary px-8 py-3.5 text-base font-semibold text-on-primary shadow-[0_0_45px_-6px_rgba(46,125,91,0.75)] transition-colors duration-300 hover:bg-secondary-hover active:scale-[0.97]">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    {slide.ctaPrimary}
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </span>
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/contact"
                strength={0.2}
                className="inline-block"
              >
                <span className="group inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:border-secondary/60 hover:bg-white/10 active:scale-[0.97]">
                  {slide.ctaSecondary}
                </span>
              </MagneticButton>
            </div>

            {/* Trust strip — two load-bearing numbers instead of a feature grid */}
            <div className="anim-fade-up delay-600 mt-14 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary-hover">
                  <UsersIcon />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none text-white">
                    <CountUp
                      end={parseInt(slide.patientsCount, 10) || 0}
                      suffix="+"
                      useFarsiDigits={isFa}
                    />
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {slide.patientsLabel}
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary-hover">
                  <StarIcon />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none text-white">
                    {isFa
                      ? toFarsiDigits(slide.ratingValue)
                      : slide.ratingValue}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {slide.ratingCount}
                  </div>
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
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l2.9 6.26L21.8 9l-5 4.87L18.2 21 12 17.27 5.8 21l1.4-7.13-5-4.87 6.9-.74L12 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
}
