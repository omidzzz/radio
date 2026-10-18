import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import HeatmapGrid from "@/components/ui/HeatmapGrid";
import { toFarsiDigits } from "@/lib/i18n/numbers";

interface PrecisionProps {
  isFa: boolean;
}

/** Isodose legend swatches — the same stops the heatmap interpolates */
const LEGEND = [
  { color: "rgba(46, 125, 91, 0.9)", en: "95% isodose", fa: "۹۵٪ ایزودوز" },
  { color: "rgba(245, 158, 11, 0.95)", en: "100% isodose", fa: "۱۰۰٪ ایزودوز" },
  { color: "rgba(239, 68, 68, 0.95)", en: "110% hotspot", fa: "نقاط داغ ۱۱۰٪" },
];

/**
 * "Precision & dose" — treatment-planning section.
 *
 * Sits between the equipment band and patient stories and gives the page
 * a second register: clinical accuracy instead of technology or comfort.
 * The whole visual is a CSS-only dose map (HeatmapGrid) with a static
 * legend — no canvas, no animation loop, and fully inert on touch.
 */
export default function Precision({ isFa }: PrecisionProps) {
  const stats = [
    {
      label: isFa ? "پوشش هدف" : "Target coverage",
      value: isFa ? `${toFarsiDigits("96.4")}٪` : "96.4%",
    },
    {
      label: isFa ? "شاخص تطابق" : "Conformity index",
      value: toFarsiDigits("1.02"),
    },
    {
      label: isFa ? "دقت تنظیم بیمار" : "Setup accuracy",
      value: isFa ? `±${toFarsiDigits("0.5")} میلی‌متر` : "±0.5 mm",
    },
  ];

  const checklist = isFa
    ? [
        "شبیه‌سازی و طراحی پلن بر پایه تصاویر CT",
        "تایید روزانه موقعیت بیمار پیش از هر جلسه",
        "کنترل مستقل صحت دوز پیش از شروع درمان",
      ]
    : [
        "CT-based simulation and plan design",
        "Daily position verification before every session",
        "Independent dose check before treatment starts",
      ];

  return (
    <section className="content-visibility relative overflow-hidden bg-soft section-pad">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-16 hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl lg:block" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        {/* ── Dose map panel ── */}
        <Reveal variant="left">
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-[var(--elevation-card)] sm:p-7">
            {/* Panel header — plan readouts, not marketing copy */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
                MOD / DOSE MAP
              </span>
              <span className="tnum font-mono text-[10px] tracking-widest text-muted">
                IMRT · 6 MV
              </span>
            </div>

            {/* Isodose field on a faint planning grid */}
            <div className="relative mt-5 flex items-center justify-center rounded-2xl border border-border/70 bg-bg px-3 py-6 sm:py-8">
              <div className="planning-grid pointer-events-none absolute inset-0 rounded-2xl opacity-30" />
              <HeatmapGrid
                cols={20}
                rows={13}
                cellSize={10}
                gap={3}
                palette="dose"
                label={
                  isFa
                    ? "نمای توزیع دوز در پلن درمانی"
                    : "Dose distribution of a treatment plan"
                }
                className="relative"
              />
            </div>

            {/* Legend */}
            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGEND.map((item) => (
                <li
                  key={item.en}
                  className="flex items-center gap-2 text-[11px] font-medium text-text-secondary"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  {isFa ? item.fa : item.en}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── Copy + numbers ── */}
        <div>
          <Reveal variant="right">
            <SectionHeader
              align="start"
              eyebrow={isFa ? "دقت و ایمنی" : "Precision & Safety"}
              title={
                isFa ? "هر میلی‌متر، برنامه‌ریزی‌شده" : "Every millimetre, planned"
              }
              subtitle={
                isFa
                  ? "دوز درمانی دقیقاً به هدف می‌رسد و بافت سالم اطراف تا حد امکان حفظ می‌شود. این نتیجهٔ یک مسیر کنترل‌شده از شبیه‌سازی تا تایید نهایی است."
                  : "The dose lands on the target while surrounding healthy tissue is spared as much as possible — the result of a controlled path from simulation to final verification."
              }
            />
          </Reveal>

          {/* Plan metrics */}
          <dl className="tnum mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    {s.label}
                  </dt>
                  <dd className="mt-1.5 text-lg font-bold text-text-primary sm:text-xl">
                    {s.value}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>

          {/* QA checklist */}
          <ul className="mt-8 space-y-3">
            {checklist.map((line, i) => (
              <Reveal key={line} delay={i * 90}>
                <li className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-primary ring-1 ring-primary/20">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="h-3 w-3"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        d="M3.5 8.5l3 3 6-6.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{line}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
