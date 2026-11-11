import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import SlideBackground from "@/components/slides/SlideBackground";

interface HeroMobileProps {
  dict: Dictionary;
  isFa: boolean;
  className?: string;
}

export default function HeroMobile({
  dict,
  isFa,
  className = "block sm:hidden",
}: HeroMobileProps) {
  const locale = isFa ? "fa" : "en";
  const bookingHref = `/${locale}/booking`;
  const servicesHref = `/${locale}/services`;

  return (
    <section
      className={`hero-mobile relative min-h-svh overflow-hidden bg-bg text-slate-900 dark:bg-deep dark:text-text-primary ${className}`}
      role="region"
      aria-roledescription={isFa ? "بخش هیرو" : "hero"}
      aria-label={
        isFa ? "معرفی خدمات و مراقبت" : "Care and services introduction"
      }
    >
      <div className="hero-mobile-visual relative z-10 mx-auto w-full max-w-88 px-6 pt-4 sm:px-8">
        <div className="hero-mobile-halo absolute inset-[5%_9%_0]" aria-hidden="true" />
        <div className="hero-mobile-orbit absolute inset-[2%_4%_3%]" aria-hidden="true" />
        <div className="hero-mobile-grid absolute inset-[10%_3%_8%]" aria-hidden="true" />
        <div className="hero-mobile-crosshair absolute right-[13%] top-[16%] h-10 w-10" aria-hidden="true">
          <span />
          <span />
          <i />
        </div>
        <div className="hero-mobile-portrait-frame relative z-10">
          <Image
            src="/images/doctor-portrait-mobile-top.webp"
            alt={
              isFa
                ? "دکتر پری قدمگاهی، متخصص رادیوتراپی و آنکولوژی"
                : "Dr. Pari Ghadamgahi, Radiotherapy & Oncology Specialist"
            }
            className="hero-mobile-portrait mx-auto aspect-square w-full rounded-full border-2 border-primary/20 object-cover object-top shadow-2xl shadow-primary/20"
            width={800}
            height={800}
            priority
            fetchPriority="high"
            sizes="(max-width: 639px) 100vw, 22rem"
          />
          <div className="hero-mobile-image-sheen" aria-hidden="true" />
        </div>
      </div>

      <SlideBackground variant="hud" className="lightbg-clip" />

      <div className="relative z-10 flex flex-col px-5 pb-[calc(2.75rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="hero-mobile-copy-panel flex flex-col items-center justify-start gap-4 py-4 text-center">
          <span className="hero-surface hero-panel-compact anim-fade-up inline-flex self-start items-center gap-2.5 rounded-full border border-primary/35 bg-primary/12 text-xs font-medium text-gold transition-colors duration-200 hover:border-primary/70 hover:bg-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute hidden h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none sm:inline-flex bg-primary-fill-hover" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-fill-hover" />
            </span>
            {isFa
              ? "متخصص رادیوتراپی و آنکولوژی"
              : "Radiotherapy & Oncology Specialist"}
          </span>

          <h1 className="hero-mobile-heading anim-fade-up delay-200 fluid-display mt-5 max-w-full font-black leading-[0.92] tracking-tight slide-main-heading text-shadow-lg sm:mt-6 sm:max-w-none">
            <span className="hero-mobile-name">{dict.home.heroTitle1}</span>
            <br className="sm:hidden" />
            <span className="hero-title-accent shimmer-text drop-shadow-soft inline-block">
              {dict.home.heroTitle2}
            </span>
          </h1>

          <div className="hero-mobile-copy anim-fade-up delay-300 mt-1 max-w-lg text-center">
            <p className="hero-subtitle hero-subtitle-mobile">
              {dict.home.heroSubtitle}
            </p>
          </div>

          <ul
            className="anim-fade-up delay-350 flex max-w-lg flex-wrap justify-center gap-2 text-xs font-semibold text-text-primary"
            aria-label={isFa ? "دستاوردهای حرفه‌ای" : "Professional achievements"}
          >
            <li className="inline-flex self-start rounded-full border border-highlight/35 bg-deep/70 px-3 py-1.5 text-highlight">
              {isFa ? "دارای بورد تخصصی" : "Board-certified specialist"}
            </li>
            <li className="inline-flex self-start rounded-full border border-border bg-surface/80 px-3 py-1.5">
              {isFa ? "تمرکز بر نوروانکولوژی" : "Neuro-oncology focus"}
            </li>
            <li className="inline-flex self-start rounded-full border border-border bg-surface/80 px-3 py-1.5">
              {isFa ? "۳ مقاله منتشرشده" : "3 published articles"}
            </li>
          </ul>

          <div className="anim-fade-up delay-400 mt-5 flex w-full flex-col gap-3 sm:mt-6 sm:gap-4">
            <Link
              href={bookingHref}
              prefetch={false}
              className="ui-button ui-button-slot tnum inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2 text-xs is-primary hero-surface hero-panel-compact"
              dir={isFa ? "rtl" : "ltr"}
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {isFa ? (
                <>
                  نوبت بعدی: <span className="font-bold">امروز ۱۴:۳۰</span>
                </>
              ) : (
                <>
                  Next Slot: <span className="font-bold">Today 14:30</span>
                </>
              )}
            </Link>
            <Link
              href={bookingHref}
              prefetch={false}
              className="group relative inline-flex min-h-12 w-full cursor-pointer select-none items-center justify-center gap-2 overflow-hidden px-6 py-3.5 font-semibold leading-relaxed ui-button ui-button-primary hero-cta"
            >
              <span className="relative flex items-center gap-2" dir="ltr">
                {dict.home.bookConsultation}
              </span>
            </Link>
            <Link
              href={servicesHref}
              prefetch={false}
              className="group relative inline-flex min-h-12 w-full cursor-pointer select-none items-center justify-center gap-2 overflow-hidden px-6 py-3 text-base font-semibold leading-relaxed ui-button ui-button-outline hero-cta"
            >
              <span className="relative flex items-center gap-2" dir="ltr">
                {dict.home.exploreServices}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}