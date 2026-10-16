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
 * Console hero — the reading-room centerpiece.
 *
 * A fixed instrument viewport: the feature photograph sits inside a
 * reticle-framed scan panel with DICOM-style corner annotations, while a
 * narrow editorial column carries the headline, a live-slot readout, and
 * a tabular metrics strip. The whole panel sits on the deep ground with a
 * planning-grid lattice behind it.
 */
export default function Hero({ dict, isFa }: HeroProps) {
  const stats = [
    { value: 15, suffix: "+", label: isFa ? "سال تجربه" : "Years Experience" },
    {
      value: 24,
      suffix: isFa ? toFarsiDigits("/7") : "/7",
      label: isFa ? "پشتیبانی" : "Support",
    },
    { value: 100, suffix: "%", label: isFa ? "دقت تشخیص" : "Diagnostic Accuracy" },
  ];

  const leadText = isFa
    ? "کلینیک ما خدمات درمانی پرتودرمانی پیشرفته را توسط متخصصان باتجربه ارائه می‌دهد. ما فناوری روز دنیا را با مراقبت شخصی ترکیب می‌کنیم تا در هر قدم از مسیر درمان همراه شما باشیم."
    : "Our clinic delivers advanced radiotherapy services through specialist clinicians. We pair today's world-class technology with personal care at every step of the journey.";

  return (
    <section className="mod-hero relative overflow-hidden bg-deep text-text-on-dark">
      {/* Planning lattice behind the whole hero */}
      <div
        aria-hidden="true"
        className="planning-grid pointer-events-none absolute inset-0 opacity-[0.35]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Status line — the console header strip */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-rule-strong)] pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            <span className="readout__label">
              {isFa ? "سیستم آماده" : "System Ready"}
            </span>
          </div>
          <span className="readout__label">
            {isFa ? "کلینیک تخصصی پرتودرمانی" : "Radiotherapy Specialist Unit"}
          </span>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Editorial column */}
          <div className="lg:col-span-5">
            <div className="panel-head">
              <span className="panel-head__idx">
                {isFa ? "۰۱" : "01"} — {isFa ? "پیش‌گفتار" : "Overview"}
              </span>
              <h1 className="type-display font-bold text-text-on-dark">
                {dict.home.heroTitle1}{" "}
                <span className="text-highlight">{dict.home.heroTitle2}</span>
              </h1>
            </div>

            <p className="section-lead mt-5 max-w-xl">{leadText}</p>

            <div className="mt-8">
              <LiveSlotBadge isFa={isFa} />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/services"
                className="btn border-[var(--color-rule-strong)] bg-transparent text-text-on-dark hover:border-highlight hover:text-highlight"
              >
                {dict.home.exploreServices}
              </Link>
            </div>

            {/* Metrics readout — tabular instrument strip */}
            <dl className="readout readout--deep tnum mt-12 grid max-w-xl grid-cols-3 gap-6 p-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-[family-name:var(--font-plex)] text-3xl font-semibold leading-none text-highlight">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      useFarsiDigits={isFa}
                    />
                  </dd>
                  <dt className="readout__label mt-2">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Scan viewport — the reticle-framed feature photograph */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Outer instrument frame */}
              <div className="reticle relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-rule-strong)] bg-surface">
                <Image
                  src="/images/hero-radiology-machine.webp"
                  alt={
                    isFa
                      ? "دستگاه پرتودرمانی پیشرفته"
                      : "Advanced radiology equipment"
                  }
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />

                {/* DICOM-style corner annotations */}
                <span className="annot top-3 left-3">
                  {isFa ? "بیمار: OP-۲۴۱" : "ID: OP-241"}
                </span>
                <span className="annot top-3 right-3">
                  {isFa ? "مدالیتی: RT" : "MOD: RT"}
                </span>
                <span className="annot bottom-3 left-3">
                  {isFa ? "پنجره: ۴۰۰/۴۰" : "W: 400 / L: 40"}
                </span>
                <span className="annot bottom-3 right-3">
                  {isFa ? "برش: ۰۱/۲۴" : "SL: 01/24"}
                </span>

                {/* Center crosshair reticle */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="100"
                    stroke="var(--color-highlight)"
                    strokeWidth="0.25"
                    strokeOpacity="0.35"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="100"
                    y2="50"
                    stroke="var(--color-highlight)"
                    strokeWidth="0.25"
                    strokeOpacity="0.35"
                  />
                </svg>
              </div>

              {/* Caption strip under the viewport */}
              <div className="mt-3 flex items-center justify-between">
                <span className="readout__label">
                  {isFa ? "۰۲" : "02"} —{" "}
                  {isFa ? "نمای زنده اتاق درمان" : "Live Treatment View"}
                </span>
                <div className="tick-ruler--h h-2.5 w-24" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom measurement scale */}
      <div className="scale-rule" aria-hidden="true" />
    </section>
  );
}

