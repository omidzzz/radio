import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import CountUp from "@/components/ui/CountUp";
import CursorGlow from "@/components/ui/CursorGlow";
import MagneticButton from "@/components/ui/MagneticButton";
import LiveSlotBadge from "@/components/ui/LiveSlotBadge";
import HeroBottomDivider from "@/components/home/HeroBottomDivider";
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
      className={`slide-entrance relative h-full min-h-[96vh] overflow-hidden bg-deep ${
        playAnim ? "slide-active" : ""
      }`}
    >
      {/* Cursor glow tracking light */}
      <CursorGlow />

      <div className="absolute inset-0 anim-fade-in">
        <Image
          src="/images/home-hero.webp"
          alt="پرتودرمانی و تصویربرداری پیشرفته"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="ken-burns object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/90 to-deep/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-deep/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] anim-fade-in delay-300 hidden lg:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300f0ff' stroke-width='0.6'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Treatment planning grid overlay — desktop only */}
      <div className="planning-grid pointer-events-none absolute inset-0 opacity-40 anim-fade-in delay-400 hidden lg:block" />

      {/* Grain — same material treatment as slide two and the dark bands */}
      <div className="grain-pattern pointer-events-none absolute inset-0 hidden opacity-[0.05] lg:block" />

      {/* Isodose contour rings — static on mobile/touch (animation killed in CSS) */}
      <div className="pointer-events-none absolute right-[8%] top-[12%] hidden lg:block">
        <div className="isodose-ring isodose-ring-1 absolute h-40 w-40 rounded-full border border-primary/20" />
        <div className="isodose-ring isodose-ring-2 absolute -inset-8 rounded-full border border-primary/15" />
        <div className="isodose-ring isodose-ring-3 absolute -inset-16 rounded-full border border-secondary/10" />
        <div className="isodose-ring isodose-ring-4 absolute -inset-24 rounded-full border border-primary/5" />
      </div>

      {/* Coordinate readout — desktop only */}
      <div className="coord-flash pointer-events-none absolute left-[4%] bottom-[18%] hidden font-mono text-[10px] tracking-widest text-highlight/50 lg:block">
        X: 12.4&nbsp;&nbsp;Y: 08.2&nbsp;&nbsp;Z: 03.1
      </div>
      <div className="coord-flash pointer-events-none absolute right-[4%] top-[12%] hidden font-mono text-[10px] tracking-widest text-secondary-hover/40 lg:block" style={{ animationDelay: "1.2s" }}>
        PLAN / IMRT&nbsp;&nbsp;ENERGY / 6 MV
      </div>

      {/* Floating ambient orbs — desktop only (2, was 3) */}
      <div className="float-bob pointer-events-none absolute left-[5%] top-[40%] h-64 w-64 rounded-full bg-primary/15 blur-3xl anim-fade-in delay-400 hidden lg:block" />
      <div className="float-bob float-bob-delay-1 pointer-events-none absolute right-[8%] top-[20%] h-72 w-72 rounded-full bg-secondary-hover/10 blur-3xl anim-fade-in delay-500 hidden lg:block" />

      <div className="relative z-10 mx-auto flex h-full min-h-[96vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="anim-fade-up delay-200 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-highlight backdrop-blur-sm transition-colors duration-200 hover:border-primary/70 hover:bg-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-hover opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-hover" />
              </span>
              {isFa
                ? "متخصص رادیوتراپی و آنکولوژی"
                : "Radiotherapy & Oncology Specialist"}
            </div>

            <h1 className="anim-fade-up delay-300 fluid-display mt-7 font-extrabold text-white">
              {dict.home.heroTitle1}{" "}
              <span className="shimmer-text bg-gradient-to-r from-primary via-secondary-hover to-primary bg-clip-text text-transparent">
                {dict.home.heroTitle2}
              </span>
            </h1>

            <p className="anim-fade-up delay-400 mt-6 max-w-lg text-lg leading-relaxed text-muted">
              {dict.home.heroSubtitle}
            </p>

            {/* Live next-slot micro CTA — opens booking modal */}
            <div className="anim-fade-up delay-450 mt-5 inline-flex">
              <LiveSlotBadge isFa={isFa} className="transition-all duration-300 hover:border-primary/70 hover:bg-primary/20 hover:shadow-[0_0_20px_-4px_rgba(26,115,82,0.5)]" />
            </div>

            <div className="anim-fade-up delay-500 mt-10 flex flex-wrap gap-4">
            <MagneticButton
              as={Link}
              href="/booking"
              strength={0.2}
              className="conic-border rounded-full"
            >
                <span className="btn-sheen group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-deep shadow-[0_0_45px_-6px_rgba(26,115,82,0.75)] transition-colors duration-200 hover:bg-primary-hover active:scale-[0.97]">
                  <span className="relative flex items-center gap-2" dir="ltr">
                    {dict.home.bookConsultation}
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
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
                href="/services"
                strength={0.2}
                className="inline-block"
              >
                <span className="group inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-primary/60 hover:bg-white/10 active:scale-[0.97]">
                  {dict.home.exploreServices}
                </span>
              </MagneticButton>
            </div>

            {/* Stats — single glass strip with dividers, calmer than 3 floaters */}
            <div className="anim-fade-up delay-600 mt-14 flex flex-wrap items-stretch gap-y-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-sm sm:gap-y-0 sm:divide-x sm:divide-white/10 sm:rtl:divide-x-reverse">
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
                <div
                  key={stat.label}
                  className="min-w-24 flex-1 cursor-default px-2 first:ps-0 sm:px-6 sm:first:ps-0"
                >
                  <div className="text-3xl font-bold tracking-tight text-white">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      useFarsiDigits={isFa}
                    />
                  </div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:col-span-7 lg:block">
            <div className="relative mx-auto aspect-[4/5] max-w-xl xl:max-w-none">
              <div className="anim-slide-right delay-500 absolute -left-4 bottom-10 z-20 h-[55%] w-[52%] overflow-hidden rounded-xl shadow-2xl shadow-primary/25 ring-1 ring-primary/30 transition-transform duration-500 will-change-transform hover:-translate-y-4 hover:-rotate-2 xl:-left-8 xl:bottom-14 xl:w-[48%]">
                <Image
                  src="/images/hero-radiology machine.webp"
                  alt="Advanced radiology equipment"
                  fill
                  sizes="(max-width: 1024px) 0vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/30" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="hud-sweep absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-highlight/30 to-transparent" />
                </div>
                <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-sm bg-deep/60 px-1.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-highlight backdrop-blur-sm">
                  <span className="hud-blink h-1.5 w-1.5 rounded-full bg-highlight" />
                  MOD/MRI
                </div>
              </div>

              <div className="anim-slide-right delay-700 absolute right-0 top-0 z-30 h-[88%] w-[70%] overflow-hidden rounded-2xl shadow-2xl shadow-deep/70 ring-1 ring-white/15 transition-transform duration-500 will-change-transform hover:-translate-y-4 hover:rotate-1">
                <Image
                  src="/images/home-radiologist.webp"
                  alt="Our radiologist"
                  fill
                  sizes="(max-width: 1024px) 0vw, 50vw"
                  className="object-cover object-top transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-deep/85 to-transparent" />
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

              <div className="anim-scale-in delay-900 absolute -right-6 top-10 z-10 hidden h-20 w-20 rounded-full border border-primary/20 lg:block" />
              <div className="anim-scale-in delay-1000 absolute -left-10 bottom-32 z-10 hidden h-14 w-14 rounded-full border border-secondary/25 lg:block" />
              <div className="anim-fade-in delay-1100 absolute right-1/3 top-1/4 z-10 hidden h-3 w-3 rounded-full bg-primary-hover/50 lg:block" />

              <div className="float-bob pointer-events-none absolute -right-14 top-1/4 hidden h-60 w-60 rounded-full bg-primary/30 blur-3xl anim-fade-in delay-400 lg:block" />
              <div className="float-bob float-bob-delay-1 pointer-events-none absolute -left-20 bottom-1/4 hidden h-48 w-48 rounded-full bg-secondary-hover/20 blur-3xl anim-fade-in delay-500 lg:block" />

              <div className="anim-fade-up delay-1000 absolute bottom-6 right-6 z-40 flex items-center gap-3.5 rounded-2xl border border-white/15 bg-deep/90 px-5 py-3.5 shadow-xl backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/25 text-highlight">
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
                  <div className="text-sm font-semibold text-white">
                    {isFa ? "تخصص تصویربرداری" : "Imaging Specialists"}
                  </div>
                  <div className="text-xs text-muted">MRI • CT • X-Ray</div>
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