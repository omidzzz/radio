import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface HeroProps {
  dict: Dictionary;
  isFa: boolean;
}

/**
 * Slide One - "Advanced imaging" cover.
 *
 * A Clinical Dossier front page: a deep ink field with a faint planning
 * grid, one framed hero image, an oversized Fraunces headline, the live
 * next-slot badge, two ruled buttons, and a ledger of three key numbers.
 * No glows, no HUD sweeps, no coordinate readouts.
 */
export default function Hero({ dict, isFa }: HeroProps) {
  const stats = [
    { value: 15, suffix: "+", label: isFa ? "سال تجربه" : "Years Experience" },
    { value: 24, suffix: isFa ? toFarsiDigits("/7") : "/7", label: isFa ? "پشتیبانی" : "Support" },
    { value: 100, suffix: "%", label: isFa ? "دقت تشخیص" : "Diagnostic Accuracy" },
  ];

  return (
    <section className="relative overflow-hidden bg-deep text-text-on-dark">
      {/* Planning grid + grain - the dossier case-file texture */}
      <div className="planning-grid pointer-events-none absolute inset-0 opacity-[0.10]" />
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />

      {/* Hero image, right half on desktop, top bleed on mobile */}
      <div className="absolute inset-y-0 end-0 hidden w-1/2 lg:block">
        <Image
          src="/images/hero-radiology machine.webp"
          alt={isFa ? "دستگاه پرتودرمانی پیشرفته" : "Advanced radiology equipment"}
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/70 to-transparent rtl:bg-gradient-to-l" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-7">
          {/* Eyebrow badge */}
          <span className="chip chip-ghost mono">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-primary" />
            {isFa ? "تکنولوژی پیشرفته تصویربرداری" : "Advanced Imaging Technology"}
          </span>

          <h1 className="type-display mt-6 font-bold text-text-on-dark">
            {dict.home.heroTitle1}{" "}
            <span className="text-highlight">{dict.home.heroTitle2}</span>
          </h1>

          <p className="section-lead mt-6 max-w-xl">{dict.home.heroSubtitle}</p>

          {/* Live next-slot micro CTA */}
          <div className="mt-6">
            <LiveSlotBadge isFa={isFa} />
          </div>

          {/* Actions */}
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/forum" className="btn btn-primary group">
              {dict.home.bookConsultation}
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
              href="/services"
              className="btn btn-outline border-[var(--color-rule-strong)] text-text-on-dark hover:border-highlight hover:text-highlight"
            >
              {dict.home.exploreServices}
            </Link>
          </div>

          {/* Ledger of key numbers */}
          <dl className="tnum mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-[var(--color-rule-strong)] pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-none text-highlight">
                  <CountUp end={stat.value} suffix={stat.suffix} useFarsiDigits={isFa} />
                </dd>
                <dt className="mono mt-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
