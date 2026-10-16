import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface ProcessProps {
  isFa: boolean;
}

/**
 * Treatment journey - the "dose rail". A sticky numbered rail runs down the
 * start edge; each step is a ruled ledger row whose index fills with signal
 * red on hover. Stacks to plain numbered rows on mobile (no-JS /
 * reduced-motion safe: pure CSS + Reveal). Replaces the old parallax zig-zag.
 */
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
    <svg key="book" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <rect x="6" y="8" width="28" height="25" rx="4" />
      <path d="M6 16h28" strokeOpacity="0.4" />
      <path d="M13 4.5v8M27 4.5v8" strokeLinecap="round" strokeWidth="1.4" />
      <circle cx="11" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="16" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="21" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="26" cy="21" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="11" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="16" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="21" cy="26" r="1.2" fill="currentColor" stroke="none" opacity="0.4" />
      <path d="M25 24l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>,
    <svg key="scan" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <circle cx="20" cy="20" r="13" strokeOpacity="0.2" strokeDasharray="3 5" />
      <circle cx="20" cy="20" r="11" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="6" strokeOpacity="0.3" />
      <path d="M20 3v6M20 31v6M3 20h6M31 20h6" strokeLinecap="round" strokeOpacity="0.35" />
      <path d="M8 30h24" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
      <path d="M16 14l8 12" strokeOpacity="0.2" strokeWidth="0.8" />
    </svg>,
    <svg key="report" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path d="M10 4h14l6 6v26a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M24 4v6h6" strokeLinejoin="round" strokeOpacity="0.5" />
      <path d="M14 20h12M14 26h9" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M14 14h6" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>,
  ];

  return (
    <section className="mod-process content-visibility band-dark section-pad">
      <div className="grain-pattern pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ChapterHead
          tone="dark"
          index="02"
          label={isFa ? "روند کار" : "How It Works"}
          align="start"
          variant="panel"
          title={
            isFa
              ? "از رزرو تا نتیجه، سه مرحله ساده"
              : "From booking to results, in three steps"
          }
          lede={
            isFa
              ? "مسیری کوتاه و شفاف از اولین تماس تا دریافت گزارش."
              : "A short, transparent path from first contact to your report."
          }
        />

        {/* Dose rail — a tick-ruler timeline: measurement scale as the spine */}
        <ol className="relative mt-12 lg:ps-30">
          <span
            aria-hidden="true"
            className="tick-ruler pointer-events-none absolute inset-y-2 hidden w-3 lg:block start-15 -translate-x-1/2 rtl:translate-x-1/2 opacity-70"
          />

          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 120}>
              <li className="group relative border-b border-[var(--color-rule-strong)] py-8 last:border-b-0 lg:py-10">
                {/* Step number — dose rail node sits on the side ruler */}
                <div className={`absolute top-8 hidden ${isFa ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"} lg:block`}>
                  <span className="tnum flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-deep font-[family-name:var(--font-vazirmatn)] text-lg font-semibold text-highlight transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-on-signal">
                    {isFa ? toFarsiDigits(p.step) : p.step}
                  </span>
                </div>

                <div className={`flex items-start gap-5 ${isFa ? "pr-8 lg:pr-12" : "pl-8 lg:pl-12"}`}>
                  <span className="reticle relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] text-highlight">
                    {icons[i]}
                  </span>
                  <div>
                    <span className="readout__label text-muted">
                      T+{String(i * 24).padStart(3, "0")}:00 · {isFa ? "مرحله" : "Stage"}{" "}
                      {isFa ? toFarsiDigits(p.step) : p.step}
                    </span>
                    <h3 className="type-h3 mt-1.5 text-text-on-dark">{p.title}</h3>
                    <p className="section-lead mt-2 max-w-xl">{p.desc}</p>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
