import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface HeroSlideTwoProps {
  dict: Dictionary;
  isFa: boolean;
}

/**
 * Slide Two - "Care journey" thesis.
 *
 * The compassionate counterpart to slide one: a circular consultation
 * portrait with a framed quote card and a two-number ledger. Same dossier
 * vocabulary (ink field, planning grid, ruled dividers) so switching
 * slides reads as one artifact, not two screens.
 */
export default function HeroSlideTwo({ dict, isFa }: HeroSlideTwoProps) {
  const slide = dict.home.heroSlide2;

  return (
    <section className="relative overflow-hidden bg-deep text-text-on-dark">
      <div className="planning-grid pointer-events-none absolute inset-0 opacity-[0.10]" />
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Left: framed circular portrait + quote card */}
        <div className="relative hidden lg:col-span-6 lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-[var(--color-rule-strong)]">
              <Image
                src="/images/home-consultation-circle.webp"
                alt={
                  isFa
                    ? "مشاوره دلسوزانه با بیمار"
                    : "Compassionate patient consultation"
                }
                fill
                sizes="45vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-deep/50 via-transparent to-transparent" />
            </div>

            {/* Quote card - dossier note pinned over the portrait */}
            <div className="surface-card absolute -bottom-4 end-0 z-20 w-[78%] max-w-xs p-4">
              <svg
                className="h-5 w-5 text-primary/60"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9.5 8C6.5 8 4 10.5 4 13.5S6.5 19 9.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C13.5 10.5 12.5 8 9.5 8zm10 0c-3 0-5.5 2.5-5.5 5.5S16.5 19 19.5 19c.4 0 .8-.05 1.2-.13-.6 1.5-1.9 2.7-3.6 3.4l.7 1.7c3.2-1.1 5.7-4 5.7-8.4V13.5C23.5 10.5 22.5 8 19.5 8z" />
              </svg>
              <p className="mt-1.5 text-[13px] leading-snug text-text-primary">
                {slide.quote}
              </p>
              <div className="mt-3 flex items-center gap-2.5 border-t border-[var(--color-border)] pt-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-primary">
                  {slide.quoteAuthor?.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold leading-none text-text-primary">
                    {slide.quoteAuthor}
                  </div>
                  <div className="mono mt-1 text-[0.66rem] leading-none text-muted">
                    {slide.quoteAuthorRole}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: compassionate copy */}
        <div className="lg:col-span-6">
          <span className="chip chip-soft mono">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-7-4.6-7-10.5A4 4 0 0 1 12 6a4 4 0 0 1 7 4.5C19 16.4 12 21 12 21Z" />
            </svg>
            {slide.badge}
          </span>

          <h1 className="type-display mt-6 font-bold text-text-on-dark">
            {slide.title1}{" "}
            <span className="text-highlight">{slide.title2}</span>
          </h1>

          <p className="section-lead mt-6 max-w-xl">{slide.subtitle}</p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/about" className="btn btn-primary group">
              {slide.ctaPrimary}
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline border-[var(--color-rule-strong)] text-text-on-dark hover:border-highlight hover:text-highlight"
            >
              {slide.ctaSecondary}
            </Link>
          </div>

          {/* Trust ledger - two load-bearing numbers */}
          <dl className="tnum mt-14 grid max-w-md grid-cols-2 gap-8 border-t border-[var(--color-rule-strong)] pt-6">
            <div>
              <dd className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-none text-highlight">
                <CountUp
                  end={parseInt(slide.patientsCount, 10) || 0}
                  suffix="+"
                  useFarsiDigits={isFa}
                />
              </dd>
              <dt className="mono mt-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
                {slide.patientsLabel}
              </dt>
            </div>
            <div>
              <dd className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-none text-highlight">
                {isFa ? toFarsiDigits(slide.ratingValue) : slide.ratingValue}
              </dd>
              <dt className="mono mt-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
                {slide.ratingCount}
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
