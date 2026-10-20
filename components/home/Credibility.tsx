import Reveal from "@/components/ui/Reveal";
import CounterRing from "@/components/ui/CounterRing";
import SectionHeader from "@/components/ui/SectionHeader";

interface CredibilityProps {
  isFa: boolean;
}

export default function Credibility({ isFa }: CredibilityProps) {
  const credibility = [
    {
      value: 98,
      label: isFa ? "رضایت بیماران" : "Patient Satisfaction",
      ringLabel: "98%",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 21s-7-4.6-7-10.5A4 4 0 0 1 12 6a4 4 0 0 1 7 4.5C19 16.4 12 21 12 21Z" strokeLinejoin="round" />
          <path d="M12 8v3l2 1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
        </svg>
      ),
    },
    {
      value: 24,
      label: isFa ? "میانگین زمان تحویل گزارش" : "Avg. Report Turnaround",
      ringLabel: "24h",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: 100,
      label: isFa ? "دقت تشخیص" : "Diagnostic Accuracy",
      ringLabel: "100%",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
  ];

  return (
    <section className="content-visibility relative overflow-hidden bg-bg section-pad">
      {/* Static grid wash — the breathing keyframe is killed project-wide in CSS */}
      <div className="breathing-grid pointer-events-none absolute inset-0 hidden opacity-40 lg:block" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <Reveal>
          <SectionHeader
            eyebrow={isFa ? "اعتماد و کیفیت" : "Trust & Quality"}
            title={isFa ? "اعتماد جهانی، مراقبت محلی" : "Global Trust, Local Care"}
          />
        </Reveal>

        {/* Stats grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {credibility.map((c, i) => (
            <Reveal key={c.label} delay={i * 200} variant="up">
              <div className="surface-card no-lift-touch group relative flex flex-col items-center p-8">
                {/* Top accent line */}
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-primary transition-colors duration-200 group-hover:bg-primary-fill group-hover:text-on-primary">
                  {c.icon}
                </div>

                {/* Ring */}
                <div className="mt-5">
                  <CounterRing
                    value={c.value}
                    size={85}
                    strokeWidth={4}
                    label={c.ringLabel}
                    duration={2000}
                  />
                </div>

                {/* Label */}
                <div className="mt-3 text-sm font-medium text-text-secondary">{c.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
