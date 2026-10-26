import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import CursorGlow from "@/components/ui/CursorGlow";
import MagneticButton from "@/components/ui/MagneticButton";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";
import SlideBackground from "@/components/slides/SlideBackground";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface HeroProps {
  dict: Dictionary;
  isFa: boolean;
  /** When true, the slide plays its staged entrance animations. */
  playAnim?: boolean;
}

export default function Hero({ dict, isFa, playAnim = true }: HeroProps) {
  return (
    <section
      className={`slide-entrance relative h-full min-h-[calc(100svh-4rem)] overflow-hidden bg-white text-slate-900 dark:bg-deep dark:text-text-primary sm:min-h-[96vh] ${
        playAnim ? "slide-active" : ""
      }`}
    >
      {/* Composable slide background — planning variant */}
      <SlideBackground variant="planning" className="lightbg-clip" />

      {/* Cursor glow tracking light */}
      <CursorGlow />

      {/* Grain — same material treatment as slide two and the dark bands */}
      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      {/* (Coordinate readout — desktop only) — removed decorative HUD elements */}

      {/* Floating ambient orbs — desktop only (2, was 3) */}
      <div className="float-bob pointer-events-none absolute left-[5%] top-[40%] h-64 w-64 rounded-full bg-gold/10 dark:bg-primary/15 blur-3xl anim-fade-in delay-400 hidden lg:block" />
      <div className="float-bob float-bob-delay-1 pointer-events-none absolute right-[8%] top-[20%] h-72 w-72 rounded-full bg-gold/20 dark:bg-primary/15 blur-3xl anim-fade-in delay-500 hidden lg:block" />

      <div className="relative z-10 mx-auto flex h-full min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 pb-24 pt-8 sm:min-h-[96vh] sm:px-6 sm:py-20 lg:px-8">
        <div className="grid w-full items-center gap-7 sm:gap-12 md:grid-cols-12 md:gap-8 lg:gap-10">
          <div className="order-2 md:order-1 md:col-span-7 xl:col-span-5">
            <div className="anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-gold backdrop-blur-sm transition-colors duration-200 hover:border-primary/70 hover:bg-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-fill-hover opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-fill-hover" />
              </span>
              {isFa
                ? "متخصص رادیوتراپی و آنکولوژی"
                : "Radiotherapy & Oncology Specialist"}
            </div>

            <h1 className="anim-fade-up delay-300 fluid-display mt-5 font-black slide-main-heading text-shadow-lg sm:mt-7">
              {dict.home.heroTitle1}{" "}
              <span className="hero-title-accent shimmer-text drop-shadow-soft">
                {dict.home.heroTitle2}
              </span>
            </h1>

            <div className="text-panel-sm inline-block rounded-xl px-4 py-2 anim-fade-up delay-400 mt-6 max-w-lg">
              <p className="text-lg leading-relaxed text-text-secondary dark:text-muted text-shadow-sm">{dict.home.heroSubtitle}</p>
            </div>

            {/* Live next-slot micro CTA — opens booking modal */}
            <div className="anim-fade-up delay-450 mt-5 inline-flex">
              <LiveSlotBadge isFa={isFa} className="transition-all duration-300 hover:border-primary hover:bg-surface hover:shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]" />
            </div>

            <div className="anim-fade-up delay-500 mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <MagneticButton
              as={Link}
              href="/booking"
              strength={0.2}
              className="conic-border rounded-full"
            >
                <span className="btn-sheen group relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full bg-button-fill px-6 py-3.5 text-base font-semibold text-button-text shadow-[0_0_45px_-6px_rgba(26,115,82,0.75)] btn-shadow-light transition-colors duration-200 hover:bg-button-fill-hover hover:text-white dark:hover:text-button-text active:scale-[0.97] sm:w-auto sm:px-8">
                  <span className="relative flex items-center gap-2" dir="ltr">
                    {dict.home.bookConsultation}
                  </span>
                </span>
              </MagneticButton>
              <MagneticButton
                as={Link}
                href="/services"
                strength={0.2}
                className="inline-block"
              >
                <span className="group inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-primary bg-surface px-6 py-3 text-text-primary shadow-sm transition-colors duration-200 hover:bg-primary hover:text-white dark:border-primary/50 dark:bg-surface dark:hover:bg-button-fill-hover dark:hover:text-button-text active:scale-[0.97] sm:w-auto backdrop-blur-sm btn-shadow-light">
                  {dict.home.exploreServices}
                </span>
              </MagneticButton>
            </div>

            <div className="anim-fade-up delay-600 mt-8 flex flex-wrap items-stretch gap-y-4 rounded-2xl border border-border/60 bg-surface/70 px-4 py-4 shadow-sm backdrop-blur-sm sm:mt-12 sm:gap-y-0 sm:divide-x sm:divide-border/60 sm:px-6 sm:py-5 sm:rtl:divide-x-reverse">
              {[
                {
                  value: 15,
                  suffix: "+",
                  label: isFa ? "سال تجربه" : "Years Experience",
                },
                {
                  value: 24,
                  suffix: isFa ? toFarsiDigits("/7") : "/7",
                  label: isFa ? "پشتیبانی" : "Support",
                },
                {
                  value: 100,
                  suffix: "%",
                  label: isFa ? "دقت تشخیص" : "Diagnostic Accuracy",
                },
              ].map((stat) => (
                <div key={stat.label} className="min-w-24 flex-1 px-2 first:ps-0 sm:px-5">
                  <div className="text-2xl font-bold text-text-primary sm:text-3xl">
                    <CountUp end={stat.value} suffix={stat.suffix} useFarsiDigits={isFa} />
                  </div>
                  <div className="mt-1 text-xs text-text-secondary sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>

          <div className="relative order-1 md:order-2 md:col-span-5 xl:col-span-7">
            <div className="relative mx-auto aspect-video w-full max-w-xl sm:aspect-[16/10] md:aspect-[4/5] xl:aspect-[4/5] xl:max-w-none">
              <div className="anim-slide-right delay-500 absolute bottom-[8%] left-0 z-20 h-[54%] w-[43%] overflow-hidden rounded-lg shadow-2xl shadow-primary/25 ring-1 ring-primary/30 transition-transform duration-500 will-change-transform hover:-translate-y-2 hover:-rotate-2 sm:bottom-[9%] sm:h-[58%] sm:w-[46%] xl:-left-8 xl:bottom-14 xl:h-[55%] xl:w-[48%] xl:rounded-xl xl:hover:-translate-y-4">
                <Image
                  src="/images/hero-radiology machine.webp"
                  alt={isFa ? "تجهیزات پیشرفته رادیوتراپی" : "Advanced radiology equipment"}
                  fill
                  sizes="(max-width: 767px) 38vw, (max-width: 1279px) 20vw, 24vw"
                  loading="eager"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/30" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="hud-sweep absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-highlight/30 to-transparent" />
                </div>
                <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-sm bg-deep/60 px-1.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                  <span className="hud-blink h-1.5 w-1.5 rounded-full bg-gold" />
                  MOD/MRI
                </div>
              </div>

              <div className="anim-slide-right delay-700 absolute right-0 top-0 z-30 h-[92%] w-[68%] overflow-hidden rounded-xl shadow-2xl shadow-deep/70 ring-1 ring-white/15 transition-transform duration-500 will-change-transform hover:-translate-y-2 hover:rotate-1 sm:h-[90%] sm:w-[70%] xl:h-[88%] xl:w-[70%] xl:rounded-2xl xl:hover:-translate-y-4">
                <Image
                  src="/images/home-radiologist.webp"
                  alt={isFa ? "پزشک متخصص رادیوتراپی و آنکولوژی" : "Radiotherapy and oncology specialist"}
                  fill
                  sizes="(max-width: 767px) 60vw, (max-width: 1279px) 32vw, 38vw"
                  loading="eager"
                  className="object-cover object-top transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/85 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
                {[
                  "left-3 top-3 border-l border-t",
                  "right-3 top-3 border-r border-t",
                  "left-3 bottom-3 border-l border-b",
                  "right-3 bottom-3 border-r border-b",
                ].map((pos) => (
                  <div
                    key={pos}
                    className={`pointer-events-none absolute h-5 w-5 ${pos} border-highlight/70`}
                  />
                ))}
                <div className="pointer-events-none absolute left-1/2 top-[38%] h-14 w-14 -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-highlight/40" />
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-highlight/40" />
                  <span className="hud-pulse absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-highlight" />
                </div>
              </div>

              <div className="anim-scale-in delay-900 absolute -right-6 top-10 z-10 hidden h-20 w-20 rounded-full border border-slate-300/40 dark:border-primary/20 lg:block" />
              <div className="anim-scale-in delay-1000 absolute -left-10 bottom-32 z-10 hidden h-14 w-14 rounded-full border border-slate-300/40 dark:border-secondary/25 lg:block" />
              <div className="anim-fade-in delay-1100 absolute right-1/3 top-1/4 z-10 hidden h-3 w-3 rounded-full bg-gold/50 dark:bg-primary-fill-hover/50 lg:block" />

              <div className="float-bob pointer-events-none absolute -right-14 top-1/4 hidden h-60 w-60 rounded-full bg-slate-400/30 blur-3xl anim-fade-in delay-400 lg:block" />
              <div className="float-bob float-bob-delay-1 pointer-events-none absolute -left-20 bottom-1/4 hidden h-48 w-48 rounded-full bg-gold/10 dark:bg-secondary-hover/20 blur-3xl anim-fade-in delay-500 lg:block" />

              <div className="anim-fade-up delay-1000 absolute bottom-6 right-6 z-40 flex items-center gap-3.5 rounded-2xl border border-white/15 dark:border-border/40 bg-white/90 dark:bg-deep/90 px-5 py-3.5 shadow-xl backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/25 text-accent">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold hero-info-title text-shadow-sm text-black dark:text-white">
                    {isFa ? "تخصص تصویربرداری" : "Imaging Specialists"}
                  </div>
                  <div className="text-xs hero-info-subtitle text-shadow-sm text-black/85 dark:text-white/90">MRI • CT • X-Ray</div>
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
