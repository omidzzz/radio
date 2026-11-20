"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { useBookingModal } from "@/components/forms/BookingModalProvider";
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
  const { openBookingModal } = useBookingModal();

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
            <div className="hero-surface hero-panel-compact anim-fade-up delay-200 inline-flex self-start items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 text-sm font-medium text-gold transition-colors duration-200 hover:border-primary/70 hover:bg-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-fill-hover opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-fill-hover" />
              </span>
              {isFa
                ? "متخصص رادیوتراپی و آنکولوژی"
                : "Radiotherapy & Oncology Specialist"}
            </div>

            <h1 className="anim-fade-up delay-300 font-black slide-main-heading text-shadow-lg sm:mt-6 text-wrap-balance text-[clamp(1.75rem,1.1rem+1.8vw,2.75rem)] leading-[1.1] mt-4">
              {dict.home.heroTitle1}
            </h1>
            <p className={`anim-fade-up delay-350 mt-2 max-w-[52ch] text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight text-gold text-wrap-balance${isFa ? " leading-[1.5] text-wrap-pretty" : ""}`}>
              {dict.home.heroTitle2}
            </p>

            <div className="anim-fade-up delay-400 mt-6 max-w-xl">
              <p className={`hero-subtitle text-justify text-justify-auto${isFa ? "" : " hyphens-auto leading-relaxed"}`}>{dict.home.heroSubtitle}</p>
            </div>

            <ul
              className="anim-fade-up delay-450 mt-4 flex flex-wrap gap-2 text-xs font-semibold text-text-primary"
              aria-label={
                isFa ? "دستاوردهای حرفه‌ای" : "Professional achievements"
              }
            >
              <li className="inline-flex self-start rounded-full border border-highlight/35 bg-deep/70 px-3 py-1.5 text-highlight">
                {isFa ? "دارای بورد تخصصی" : "Board-certified specialist"}
              </li>
              <li className="inline-flex self-start rounded-full border border-border bg-surface/80 px-3 py-1.5">
                {isFa ? "درمان پیشرفته" : "Advanced Treatment"}
              </li>
              <li className="inline-flex self-start rounded-full border border-border bg-surface/80 px-3 py-1.5">
                {isFa ? "۳ مقاله منتشرشده" : "3 published articles"}
              </li>
            </ul>

            <div className="anim-fade-up delay-500 mt-5 inline-flex self-start">
              <LiveSlotBadge
                isFa={isFa}
                className="hero-surface hero-panel-compact transition-all duration-300 hover:border-primary hover:bg-surface hover:shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]"
              />
            </div>

            <div className="anim-fade-up delay-550 mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <button
                type="button"
                onClick={openBookingModal}
                className="conic-border w-full sm:w-auto ui-button ui-button-primary hero-cta"
              >
                <span className="hero-cta btn-sheen relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden px-6 py-3.5 text-base sm:w-auto sm:px-8">
                  <span className="relative flex items-center gap-2" dir="ltr">
                    {dict.home.bookConsultation}
                  </span>
                </span>
              </button>
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
              <div
                className={`hero-visual-backplate absolute ${!isFa ? "scale-x-[-1]" : ""} ${isFa ? "inset-[8%_2%_2%_5%]" : "inset-[8%_5%_2%_2%]}"}`}
                aria-hidden="true"
              />
              <div
                className={`hero-visual-grid absolute ${!isFa ? "scale-x-[-1]" : ""} ${isFa ? "inset-[6%_0_4%_8%]" : "inset-[6%_8%_4%_0%]}"}`}
                aria-hidden="true"
              />
              <div
                className={`hero-visual-orbit hero-visual-orbit-primary absolute ${!isFa ? "scale-x-[-1]" : ""} ${isFa ? "inset-[5%_0_7%_10%]" : "inset-[5%_10%_7%_0%]}"}`}
                aria-hidden="true"
              />
              <div
                className={`hero-visual-orbit hero-visual-orbit-secondary absolute ${!isFa ? "scale-x-[-1]" : ""} ${isFa ? "inset-[14%_8%_13%_2%]" : "inset-[14%_2%_13%_8%]}"}`}
                aria-hidden="true"
              />
              <div
                className={`hero-visual-halo absolute ${!isFa ? "scale-x-[-1]" : ""} ${isFa ? "inset-[12%_4%_8%_12%]" : "inset-[12%_12%_8%_4%]}"}`}
                aria-hidden="true"
              />

              <div className={`hero-image-card hero-image-card-main anim-slide-right delay-700 absolute ${isFa ? "left-0" : "right-0"} top-0 z-30 h-[88%] max-h-[62rem] w-[68%] overflow-hidden rounded-xl shadow-2xl shadow-deep/70 ring-1 ring-white/15 transition-transform duration-500 will-change-transform hover:-translate-y-2 hover:rotate-1 hover:scale-105 sm:h-[86%] sm:w-[70%] xl:h-[84%] xl:w-[70%] xl:hover:-translate-y-4 xl:hover:scale-105`}>
                <ViewportImage
                  src="/images/1000003044.webp"
                  mobileSrc="/images/1000003044.webp"
                  alt={
                    isFa
                      ? "پزشک متخصص رادیوتراپی و آنکولوژی"
                      : "Radiotherapy and oncology specialist"
                  }
                  width={536}
                  height={930}
                  loading="eager"
                  fetchPriority="high"
                  className="absolute inset-0 block h-full w-full object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
                <div className="hero-image-glass-line pointer-events-none absolute inset-x-0 top-[18%] h-px" />
                {isFa ? (
                  <>
                    <div className="pointer-events-none absolute h-5 w-5 left-3 top-3 border-l border-t border-highlight/70" />
                    <div className="pointer-events-none absolute h-5 w-5 left-3 bottom-3 border-l border-b border-highlight/70" />
                  </>
                ) : (
                  <>
                    <div className="pointer-events-none absolute h-5 w-5 right-3 top-3 border-r border-t border-highlight/70" />
                    <div className="pointer-events-none absolute h-5 w-5 right-3 bottom-3 border-r border-b border-highlight/70" />
                  </>
                )}
                
              </div>
                
              <div className={`anim-scale-in delay-900 absolute ${isFa ? "-right-6" : "-left-6"} top-10 z-10 hidden h-20 w-20 rounded-full border border-slate-300/40 dark:border-primary/20 lg:block`} />
              <div className={`anim-scale-in delay-1000 absolute ${isFa ? "-left-10" : "-right-10"} bottom-32 z-10 hidden h-14 w-14 rounded-full border border-slate-300/40 dark:border-secondary/25 lg:block`} />
              <div className={`anim-fade-in delay-1100 absolute ${isFa ? "right-1/3" : "left-1/3"} top-1/4 z-10 hidden h-3 w-3 rounded-full bg-gold/50 dark:bg-primary-fill-hover/50 lg:block`} />
            </div>
          </div>
        </div>
      </div>

      <HeroBottomDivider />
    </section>
  );
}