import ScrollRotateImage from "@/components/ScrollRotateImage";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface ProcessProps {
  isFa: boolean;
}

export default function Process({ isFa }: ProcessProps) {
  const process = [
    {
      step: "01",
      title: isFa ? "رزرو نوبت" : "Book",
      desc: isFa
        ? "نوبت خود را آنلاین یا با یک تماس، در کمتر از دو دقیقه رزرو کنید."
        : "Schedule your scan online or by phone — most slots confirm in under two minutes.",
    },
    {
      step: "02",
      title: isFa ? "انجام اسکن" : "Scan",
      desc: isFa
        ? "یک تکنولوژیست دارای مجوز، شما را در تمام مراحل اسکن همراهی می‌کند."
        : "A licensed technologist walks you through the exam, start to finish.",
    },
    {
      step: "03",
      title: isFa ? "دریافت گزارش" : "Report",
      desc: isFa
        ? "رادیولوژیست تصاویر را بررسی می‌کند و پزشک شما ظرف ۲۴ ساعت نتیجه را دریافت می‌کند."
        : "A radiologist reads your images; your doctor has results within 24 hours.",
    },
  ];

  const icons = [
    <svg
      key="book"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      {/* Calendar/booking grid */}
      <rect x="6" y="8" width="28" height="25" rx="4" />
      <path d="M6 16h28" strokeOpacity="0.4" />
      <path d="M13 4.5v8M27 4.5v8" strokeLinecap="round" strokeWidth="1.4" />
      {/* Date grid dots */}
      <circle cx="11" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="16" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="21" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="26" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="11" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="16" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="21" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      {/* Confirmation checkmark */}
      <path d="M25 24l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>,
    <svg
      key="scan"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      {/* Scanner gantry ring */}
      <circle cx="20" cy="20" r="13" strokeOpacity="0.2" strokeDasharray="3 5" />
      <circle cx="20" cy="20" r="11" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="6" strokeOpacity="0.3" />
      {/* Crosshair */}
      <path d="M20 3v6M20 31v6M3 20h6M31 20h6" strokeLinecap="round" strokeOpacity="0.35" />
      {/* Patient bed line */}
      <path d="M8 30h24" strokeOpacity="0.25" strokeWidth="1" />
      {/* Core dot */}
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
      {/* Scan beam indicator */}
      <path d="M16 14l8 12" strokeOpacity="0.2" strokeWidth="0.8" />
    </svg>,
    <svg
      key="report"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      {/* Document */}
      <path d="M10 4h14l6 6v26a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M24 4v6h6" strokeOpacity="0.4" />
      {/* Report content lines */}
      <path d="M13 14h14M13 18h10M13 22h12" strokeOpacity="0.2" strokeWidth="0.8" />
      {/* Diagnostic checkmark */}
      <path d="M17 28l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      {/* Urgency indicator */}
      <circle cx="26" cy="14" r="2" strokeOpacity="0.3" strokeWidth="0.8" />
    </svg>,
  ];

  return (
    <section className="content-visibility relative overflow-hidden bg-soft section-pad">
      {/* diagnostic dot-grid — desktop only, calmer */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-20 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-1/4 hidden h-80 w-80 rounded-full bg-primary/5 blur-3xl lg:block" />

      {/* stray decorative marks — desktop only */}
      <div className="pointer-events-none absolute right-[10%] top-16 hidden h-24 w-24 rounded-full border border-primary/15 lg:block" />
      <div className="pointer-events-none absolute left-[6%] bottom-20 hidden h-16 w-16 rounded-full border border-secondary/15 lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Scroll-triggered flanking images */}
        <ScrollRotateImage
          src="/images/process-left.webp"
          alt=""
          side="left"
          className={`absolute top-[8%] z-0 hidden w-[220px] drop-shadow-2xl lg:block xl:w-[280px] ${
            isFa ? "left-[-4%]" : "right-[-4%]"
          }`}
        />
        <ScrollRotateImage
          src="/images/process-right.webp"
          alt=""
          side="right"
          className={`absolute bottom-[6%] z-0 hidden w-[220px] drop-shadow-2xl lg:block xl:w-[280px] ${
            isFa ? "right-[-4%]" : "left-[-4%]"
          }`}
        />

        {/* header — aligned based on direction */}
        <Reveal
          className={`mb-14 max-w-xl lg:mb-16 ${isFa ? "lg:mr-[8%]" : "lg:ml-[8%]"}`}
        >
          <SectionHeader
            align="start"
            eyebrow={isFa ? "روند کار" : "How It Works"}
            title={
              isFa
                ? "از رزرو تا نتیجه، سه مرحله ساده"
                : "From booking to results, in three steps"
            }
            subtitle={
              isFa
                ? "مسیری کوتاه و شفاف از اولین تماس تا دریافت گزارش."
                : "A short, transparent path from first contact to your report."
            }
          />
        </Reveal>

        {/* staggered steps */}
        <div className="relative">
          {/* continuous vertical spine (desktop) — static dot, no pulse */}
          <div
            className={`pointer-events-none absolute top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent lg:block ${
              isFa ? "right-[12%]" : "left-[12%]"
            }`}
          >
            <span className="absolute left-1/2 top-8 h-2 w-2 -translate-x-1/2 rounded-full bg-primary" />
          </div>

          <div className="space-y-12 lg:space-y-20">
            {process.map((p, i) => {
              // In RTL, we invert the odd/even logic for stagger direction
              const isOdd = isFa ? i % 2 === 1 : i % 2 === 0;

              return (
                <Reveal
                  key={p.step}
                  delay={i * 120}
                  variant={i % 2 === 0 ? "left" : "right"}
                >
                  <div
                    className={`group relative flex flex-col gap-6 lg:flex-row lg:items-center ${
                      isOdd ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* number + spine node */}
                    <div
                      className={`relative z-10 flex shrink-0 items-center ${
                        isOdd ? "lg:w-[24%]" : "lg:w-[24%] lg:justify-end"
                      }`}
                    >
                      <div className="relative">
                        {/* large faded background number */}
                        <span
                          className={`pointer-events-none absolute -top-8 select-none text-7xl font-black text-primary/10 ${
                            isFa ? "-right-4" : "-left-4"
                          }`}
                        >
                          {isFa ? toFarsiDigits(p.step) : p.step}
                        </span>

                        {/* active node */}
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/40 bg-surface text-base font-bold text-primary shadow-sm transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                          {isFa ? toFarsiDigits(p.step) : p.step}
                        </div>

                        {/* modality icon badge, overlapping corner */}
                        <div
                          className={`absolute -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-secondary shadow-sm ${
                            isFa ? "-left-2" : "-right-2"
                          }`}
                        >
                          {icons[i]}
                        </div>
                      </div>
                    </div>

                    {/* content card — pulled further left or right */}
                    <div
                      className={`relative flex-1 ${
                        isOdd
                          ? isFa
                            ? "lg:mr-0 lg:ml-auto lg:max-w-md"
                            : "lg:ml-0 lg:mr-auto lg:max-w-md"
                          : isFa
                          ? "lg:mr-auto lg:ml-0 lg:max-w-md"
                          : "lg:ml-auto lg:mr-0 lg:max-w-md"
                      }`}
                    >
                      <div className="surface-card no-lift-touch group relative overflow-hidden p-7">
                        {/* Fraction counter badge — treatment plan motif */}
                        <div className="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full border border-primary/20 bg-soft px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-primary sm:flex">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          FRAC / {isFa ? toFarsiDigits("35") : "35"}
                        </div>

                        {/* small accent bar */}
                        <div
                          className={`mb-4 h-1 w-10 rounded-full bg-primary/60 ${
                            isOdd
                              ? isFa
                                ? "origin-right ml-auto"
                                : "origin-left"
                              : isFa
                              ? "origin-left"
                              : "origin-right ml-auto"
                          }`}
                        />

                        <h3 className="text-xl font-semibold text-text-primary">
                          {p.title}
                        </h3>
                        <p className="mt-3 leading-relaxed text-text-secondary">
                          {p.desc}
                        </p>
                      </div>

                      {/* connector line toward the spine (desktop only) */}
                      <div
                        className={`pointer-events-none absolute top-1/2 hidden h-px w-12 -translate-y-1/2 bg-border lg:block ${
                          isOdd
                            ? isFa
                              ? "-right-12"
                              : "-left-12"
                            : isFa
                            ? "-left-12"
                            : "-right-12"
                        }`}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}