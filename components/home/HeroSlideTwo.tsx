import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";
import SlideBackground from "@/components/slides/SlideBackground";

interface HeroSlideTwoProps {
  dict: Dictionary;
  isFa: boolean;
  playAnim?: boolean;
}

export default function HeroSlideTwo({
  dict,
  isFa,
  playAnim = true,
}: HeroSlideTwoProps) {
  const slide = dict.home.heroSlide2;
  const locale = isFa ? "fa" : "en";

  return (
    <section
      className={`slide-entrance relative -mt-[4.5rem] h-full min-h-[100svh] overflow-hidden bg-white text-slate-900 dark:bg-deep dark:text-text-primary sm:min-h-[100vh] ${
        playAnim ? "slide-active" : ""
      }`}
    >
      <SlideBackground variant="care" className="lightbg-clip" />
      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      <div className="relative z-10 mx-auto flex h-full min-h-[100svh] max-w-7xl items-center px-4 pb-24 pt-8 sm:min-h-[100vh] sm:px-6 sm:py-20 lg:px-8">
        <div className="grid w-full items-center gap-8 sm:gap-12 md:grid-cols-12 md:gap-8 lg:gap-10">
          <div className="relative order-1 md:col-span-5 xl:col-span-7">
            <div className="anim-scale-in relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl shadow-xl ring-1 ring-secondary/15 sm:aspect-[16/10] md:aspect-[4/5] md:rounded-2xl xl:aspect-square xl:max-w-lg xl:rounded-full">
              <Image
                src="/images/home-consultation-circle.webp"
                alt={isFa ? "دکتر پری قدمگاهی در محیط درمانی" : "Dr. Pari Ghadamgahi in a clinical setting"}
                fill
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) 38vw, 34vw"
                loading="lazy"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="order-2 md:col-span-7 xl:col-span-5">
            <div className="anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary-hover backdrop-blur-sm">
              {slide.badge}
            </div>
            <h2 className="anim-fade-up delay-300 fluid-display mt-5 font-black slide-main-heading text-shadow-lg sm:mt-7">
              {slide.title1} <span className="hero-title-accent shimmer-text drop-shadow-soft">{slide.title2}</span>
            </h2>
            <div className="text-panel-sm mt-6 inline-block max-w-lg rounded-xl px-4 py-2 anim-fade-up delay-400">
              <p className="text-lg leading-relaxed text-black/85 dark:text-white/90 text-shadow-sm">{slide.subtitle}</p>
            </div>
            <div className="anim-fade-up delay-500 mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <MagneticButton
                as={Link}
                href={`/${locale}/about`}
                strength={0.2}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-secondary px-7 py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                {slide.ctaPrimary}
              </MagneticButton>
              <MagneticButton
                as={Link}
                href={`/${locale}/contact`}
                strength={0.2}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-primary bg-surface px-7 py-3 text-text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {slide.ctaSecondary}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
      <HeroBottomDivider />
    </section>
  );
}