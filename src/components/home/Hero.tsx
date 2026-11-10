import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CursorGlow from "@/components/ui/CursorGlow";
import MagneticButton from "@/components/ui/MagneticButton";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";
import SlideBackground from "@/components/slides/SlideBackground";
import ViewportImage from "@/components/ui/ViewportImage";

const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

interface HeroProps {
  dict: Dictionary;
  isFa: boolean;
  playAnim?: boolean;
}

export default function Hero({ dict, isFa, playAnim = true }: HeroProps) {
  const locale = isFa ? "fa" : "en";

  return (
    <section
      dir={isFa ? "rtl" : "ltr"}
      className={`slide-entrance relative h-full min-h-[100svh] overflow-hidden bg-white text-slate-900 dark:bg-deep dark:text-text-primary sm:min-h-[96vh] ${
        playAnim ? "slide-active" : ""
      }`}
    >
      <SlideBackground variant="planning" className="lightbg-clip" />
      <CursorGlow />
      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      <div className="relative z-10 mx-auto flex h-full min-h-[100svh] max-w-7xl items-center px-4 pb-24 pt-[4.5rem] sm:min-h-[100vh] sm:px-6 sm:py-20 lg:px-8">
        <div className="grid w-full items-center gap-7 sm:gap-12 md:grid-cols-12 md:gap-8 lg:gap-10">
          <div className="hero-copy-column order-2 md:order-1 md:col-span-7 xl:col-span-5">
            <div className="hero-surface hero-panel-compact anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 text-sm font-medium text-gold transition-colors duration-200 hover:border-primary/70 hover:bg-primary/20">
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

            <div className="anim-fade-up delay-400 mt-6 max-w-xl">
              <p className="hero-subtitle">
                {dict.home.heroSubtitle}
              </p>
            </div>

            <ul
              className="anim-fade-up delay-450 mt-4 flex flex-wrap gap-2 text-xs font-semibold text-text-primary"
              aria-label={isFa ? "دستاوردهای حرفه‌ای" : "Professional achievements"}
            >
              <li className="rounded-full border border-highlight/35 bg-deep/70 px-3 py-1.5 text-highlight">
                {isFa ? "دارای بورد تخصصی" : "Board-certified specialist"}
              </li>
              <li className="rounded-full border border-border bg-surface/80 px-3 py-1.5">
                {isFa ? "تمرکز بر نوروانکولوژی" : "Neuro-oncology focus"}
              </li>
              <li className="rounded-full border border-border bg-surface/80 px-3 py-1.5">
                {isFa ? "۳ مقاله منتشرشده" : "3 published articles"}
              </li>
            </ul>

            <div className="anim-fade-up delay-500 mt-5 inline-flex">
              <LiveSlotBadge
                isFa={isFa}
                className="hero-surface hero-panel-compact transition-all duration-300 hover:border-primary hover:bg-surface hover:shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]"
              />
            </div>

            <div className="anim-fade-up delay-550 mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <MagneticButton
                as={Link}
                href={`/${locale}/booking`}
                prefetch={false}
                strength={0.2}
                variant="primary"
                className="conic-border w-full sm:w-auto"
              >
                <span className="hero-cta btn-sheen relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden px-6 py-3.5 text-base sm:w-auto sm:px-8">
                  <span className="relative flex items-center gap-2" dir="ltr">
                    {dict.home.bookConsultation}
                  </span>
                </span>
              </MagneticButton>
              <MagneticButton
                as={Link}
                href={`/${locale}/services`}
                prefetch={false}
                strength={0.2}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <span className="hero-cta inline-flex min-h-12 w-full items-center justify-center px-6 py-3 sm:w-auto">
                  {dict.home.exploreServices}
                </span>
              </MagneticButton>
            </div>
          </div>

          <div className="relative order-1 md:order-2 md:col-span-5 xl:col-span-7">
            <div className="hero-visual-shell relative mx-auto aspect-video w-full max-w-xl sm:aspect-[16/10] md:aspect-[4/5] xl:aspect-[4/5] xl:max-w-none">
              <div className="hero-visual-backplate absolute inset-[8%_2%_2%_5%]" aria-hidden="true" />
              <div className="hero-visual-grid absolute inset-[6%_0_4%_8%]" aria-hidden="true" />
              <div className="hero-visual-orbit hero-visual-orbit-primary absolute inset-[5%_0_7%_10%]" aria-hidden="true" />
              <div className="hero-visual-orbit hero-visual-orbit-secondary absolute inset-[14%_8%_13%_2%]" aria-hidden="true" />
              <div className="hero-visual-halo absolute inset-[12%_4%_8%_12%]" aria-hidden="true" />

              <div className="hero-image-card hero-image-card-machine anim-slide-right delay-500 absolute bottom-[8%] left-0 z-20 h-[54%] w-[43%] overflow-hidden rounded-lg shadow-2xl shadow-primary/25 ring-1 ring-primary/30 transition-transform duration-500 will-change-transform hover:-translate-y-2 hover:-rotate-2 sm:bottom-[9%] sm:h-[58%] sm:w-[46%] xl:-left-8 xl:bottom-14 xl:h-[55%] xl:w-[48%] xl:rounded-xl xl:hover:-translate-y-4">
                <ViewportImage
                  src="/images/hero-radiology-machine-desktop.webp"
                  mobileSrc={TRANSPARENT_PIXEL}
                  alt={
                    isFa
                      ? "تجهیزات پیشرفته رادیوتراپی"
                      : "Advanced radiology equipment"
                  }
                  width={332}
                  height={323}
                  loading="lazy"
                  fetchPriority="low"
                  className="absolute inset-0 block h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/30" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="hud-sweep absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-highlight/30 to-transparent" />
                </div>
              </div>

              <div className="hero-image-card hero-image-card-main anim-slide-right delay-700 absolute right-0 top-0 z-30 h-[92%] w-[68%] overflow-hidden rounded-xl shadow-2xl shadow-deep/70 ring-1 ring-white/15 transition-transform duration-500 hover:-translate-y-2 hover:rotate-1 sm:h-[90%] sm:w-[70%] xl:h-[88%] xl:w-[70%] xl:hover:-translate-y-4">
                <ViewportImage
                  src="/images/home-radiologist-desktop-top.webp"
                  mobileSrc={TRANSPARENT_PIXEL}
                  alt={
                    isFa
                      ? "پزشک متخصص رادیوتراپی و آنکولوژی"
                      : "Radiotherapy and oncology specialist"
                  }
                  width={536}
                  height={930}
                  loading="eager"
                  fetchPriority="high"
                  className="absolute inset-0 block h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105 will-change-transform"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
                <div className="hero-image-glass-line pointer-events-none absolute inset-x-0 top-[18%] h-px" />
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
                <div className="pointer-events-none absolute left-1/2 top-[38%] hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 sm:block">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-highlight/40" />
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-highlight/40" />
                  <span className="hud-pulse absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-highlight" />
                </div>
              </div>

              <div className="anim-scale-in delay-900 absolute -right-6 top-10 z-10 hidden h-20 w-20 rounded-full border border-slate-300/40 dark:border-primary/20 lg:block" />
              <div className="anim-scale-in delay-1000 absolute -left-10 bottom-32 z-10 hidden h-14 w-14 rounded-full border border-slate-300/40 dark:border-secondary/25 lg:block" />
              <div className="anim-fade-in delay-1100 absolute right-1/3 top-1/4 z-10 hidden h-3 w-3 rounded-full bg-gold/50 dark:bg-primary-fill-hover/50 lg:block" />
            </div>
          </div>
        </div>
      </div>

      <HeroBottomDivider />
    </section>
  );
}