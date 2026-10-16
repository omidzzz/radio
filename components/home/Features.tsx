import Reveal from "@/components/ui/Reveal";
import ChapterHead from "@/components/ui/ChapterHead";

interface FeaturesProps {
  dict: any;
  isFa: boolean;
}

const featureSvgs = {
  MRI: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Outer field rings */}
      <circle cx="40" cy="40" r="30" strokeOpacity="0.15" strokeDasharray="3 5" />
      <circle cx="40" cy="40" r="26" strokeOpacity="0.3" />
      {/* Main bore ring */}
      <circle cx="40" cy="40" r="20" strokeWidth="1.8" />
      {/* Inner bore depth */}
      <circle cx="40" cy="40" r="14" strokeOpacity="0.25" strokeDasharray="2 3" />
      <circle cx="40" cy="40" r="8" strokeOpacity="0.4" />
      {/* Patient cross-section silhouette */}
      <ellipse cx="40" cy="38" rx="6" ry="9" strokeOpacity="0.5" strokeWidth="1.2" />
      {/* Crosshair targeting */}
      <path d="M40 16v8M40 56v8M18 40h8M54 40h8" strokeOpacity="0.3" strokeWidth="1.2" />
      {/* Core highlight */}
      <circle cx="40" cy="40" r="2.5" fill="currentColor" stroke="none" />
      {/* Field strength indicator */}
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">3.0T</text>
    </svg>
  ),
  CT: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Gantry outer ring */}
      <circle cx="40" cy="40" r="26" strokeOpacity="0.2" strokeDasharray="4 6" />
      <circle cx="40" cy="40" r="23" strokeWidth="1.8" />
      {/* Aperture */}
      <circle cx="40" cy="40" r="14" strokeOpacity="0.35" />
      <circle cx="40" cy="40" r="9" strokeOpacity="0.5" strokeWidth="1.2" />
      {/* X-ray beam indicator */}
      <path d="M40 18v8M40 54v8M18 40h8M52 40h8" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* Rotating detector arc */}
      <path d="M28 28a16 16 0 0 1 24 0" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M28 52a16 16 0 0 0 24 0" strokeOpacity="0.3" strokeLinecap="round" />
      {/* Core */}
      <circle cx="40" cy="40" r="3" fill="currentColor" stroke="none" />
      {/* Slice indicator */}
      <rect x="33" y="12" width="14" height="5" rx="1.5" strokeOpacity="0.4" strokeWidth="1" />
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">SLICE</text>
    </svg>
  ),
  US: (
    <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      {/* Transducer probe shape */}
      <path d="M28 18h24a4 4 0 0 1 4 4v6c0 8-4 14-8 18l-4 4a6 6 0 0 1-8 0l-4-4c-4-4-8-10-8-18v-6a4 4 0 0 1 4-4z" strokeLinejoin="round" />
      {/* Sound wave pulses */}
      <path d="M40 12v6" strokeOpacity="0.4" strokeWidth="1.2" />
      <path d="M36 8v4M44 8v4" strokeOpacity="0.25" strokeWidth="1" />
      {/* Ultrasound beam cone */}
      <path d="M34 32l-8 20M46 32l8 20" strokeOpacity="0.3" strokeLinecap="round" />
      {/* Image scan lines */}
      <path d="M30 42h20M32 48h16M34 54h12" strokeOpacity="0.25" strokeWidth="0.8" />
      {/* Doppler pulse */}
      <circle cx="40" cy="40" r="2" fill="currentColor" stroke="none" />
      <text x="40" y="72" textAnchor="middle" fontSize="5" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.5">DOPPLER</text>
    </svg>
  ),
};

export default function Features({ dict, isFa }: FeaturesProps) {
  const features = [
    { code: "MRI", title: dict.home.feature1Title, desc: dict.home.feature1Desc },
    { code: "CT", title: dict.home.feature2Title, desc: dict.home.feature2Desc },
    { code: "US", title: dict.home.feature3Title, desc: dict.home.feature3Desc },
  ];

  return (
    <section className="mod-features content-visibility relative section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="01"
          label={isFa ? "خدمات تصویربرداری" : "Imaging Services"}
          title={dict.home.featuresTitle}
          variant="panel"
          lede={
            isFa
              ? "ترکیبی از تخصص پزشکی و فناوری پیشرفته تصویربرداری"
              : "Precision medicine powered by cutting-edge imaging technology"
          }
        />

        {/* Instrument modules — ruled ledger rows, not a card grid */}
        <ul className="mod-frame-ledger mt-12 border-t border-[var(--color-border)]">
          {features.map((feature, i) => (
            <Reveal key={feature.code} delay={i * 110}>
              <li className="group grid grid-cols-1 items-start gap-x-8 gap-y-4 border-b border-[var(--color-border)] py-8 sm:grid-cols-[auto_1fr] sm:py-10">
                <div className="flex items-center gap-5 sm:flex-col sm:items-start sm:gap-4">
                  <span className="reticle relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-soft text-primary transition-colors duration-200 group-hover:border-primary/50">
                    {featureSvgs[feature.code as keyof typeof featureSvgs]}
                  </span>
                  <span className="readout__label">
                    CH-{String(i + 1).padStart(2, "0")} / {feature.code}
                  </span>
                </div>

                <div>
                  <h3 className="type-h3 text-text-primary">{feature.title}</h3>
                  <p className="section-lead mt-3 max-w-2xl">{feature.desc}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}