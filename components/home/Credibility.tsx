import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import ChapterHead from "@/components/ui/ChapterHead";

interface CredibilityProps {
  isFa: boolean;
}

export default function Credibility({ isFa }: CredibilityProps) {
  const credibility = [
    {
      value: 98,
      suffix: "%",
      label: isFa ? "رضایت بیماران" : "Patient Satisfaction",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 21s-7-4.6-7-10.5A4 4 0 0 1 12 6a4 4 0 0 1 7 4.5C19 16.4 12 21 12 21Z" strokeLinejoin="round" />
          <path d="M12 8v3l2 1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
        </svg>
      ),
    },
    {
      value: 24,
      suffix: "h",
      label: isFa ? "میانگین زمان تحویل گزارش" : "Avg. Report Turnaround",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: 100,
      suffix: "%",
      label: isFa ? "دقت تشخیص" : "Diagnostic Accuracy",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
  ];

  return (
    <section className="mod-credibility content-visibility relative overflow-hidden section-pad">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <Reveal>
          <ChapterHead
            index="05"
            label={isFa ? "اعتماد و کیفیت" : "Trust & Quality"}
            title={isFa ? "اعتماد جهانی، مراقبت محلی" : "Global Trust, Local Care"}
            variant="panel"
          />
        </Reveal>

        {/* Instrument readouts — mono tiles with tabular numerals */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {credibility.map((c, i) => (
            <Reveal key={c.label} delay={i * 200} variant="up">
              <div className="readout reticle group flex h-full flex-col p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-soft text-primary">
                    {c.icon}
                  </span>
                  <span className="readout__label">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-6 font-[family-name:var(--font-plex)] text-4xl font-semibold leading-none text-primary">
                  <CountUp end={c.value} suffix={c.suffix} useFarsiDigits={isFa} />
                </div>

                <div className="mt-3 text-sm font-medium text-text-secondary">
                  {c.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
